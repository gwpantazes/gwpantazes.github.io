---
layout: post
title: Zombie Drivers and Adding a Container Init Process
---

**Tags/Keywords:** #TIL #docker #kubernetes #container #selenium #linux #unix #process #jib

When writing an automated UI test suite with Selenium WebDriver, the number of processes usually isn't an issue. When running a test suite on a typical OS, the OS cleans up completed processes for us.

Let's instead run within a docker container of the same test suite application. If we use [jib](https://github.com/GoogleContainerTools/jib) to build our Java project into a container, the [default entrypoint] looks like the following code block. Notice how the entrypoint goes straight into the main `java` process.

```dockerfile
# Jib's default entrypoint when container.entrypoint is not set
ENTRYPOINT ["java", jib.container.jvmFlags, "-cp", "/app/resources:/app/classes:/app/libs/*", jib.container.mainClass]
CMD [jib.container.args]
```

When you try running the test suite application container, you'll get a nasty shock! Running `ps` will return a massive list of `defunct` zombie processes spawned by the `ChromeDriver` that aren't being automatically cleaned up by the OS.

See: [What is a \<defunct\> process, and why doesn't it get killed? - AskUbuntu](https://askubuntu.com/questions/201303/what-is-a-defunct-process-and-why-doesnt-it-get-killed)

> Manual page ps(1) says:
>
> Processes marked <defunct> are dead processes (so-called "zombies") that remain because their parent has not destroyed them properly. These processes will be destroyed by init(8) if the parent process exits.

My test suite only has a couple hundred test cases, but each test case must have spawned quite a few processes due to starting a `ChromeDriver`, the associated browser process, and all of its subprocesses. The pid count rapidly reached 32765, and at that point probably starved of resources and got stuck since a common maximum pid is 32768. At this point the container ground to a halt. Attached services got stuck, as did the Java application logs.

Which leads to the <abbr title="Today I Learned">TIL</abbr>:

A Docker container by default omits an `init` process because it is assumed that docker containers will only have a single, or finite number of, processes. This default saves resources for the simple base case that many containers use.

As far as I understand it, the `init` sets up two things:

1. Periodically calls the OS `wait()` during which the OS can clean up processes
2. Sets up signal handling such as `SIGTERM`

Signal handling will be useful (pretty sure I've been frustrated by inability to `kill` before),
but the automatic process cleanup will be essential.

The best practice is to run an `init` on PID 1, rather then letting your "main" program entry point run on PID 1.

The following is an excerpt from [StevenACoffman/Docker Best Practices.md](https://gist.github.com/StevenACoffman/41fee08e8782b411a4a26b9700ad7af5#dont-run-pid-1):

<blockquote cite="https://gist.github.com/StevenACoffman/41fee08e8782b411a4a26b9700ad7af5#dont-run-pid-1">

### Don't run PID 1

Use tini or dumb-init (see below for why)

#### Dumb-init or Tini

PID 1 is special in unix, and so omitting an init system often leads to incorrect handling of processes and signals, and can result in problems such as containers which can't be gracefully stopped, or leaking containers which should have been destroyed.

In Linux, processes in a PID namespace form a tree with each process having a parent process. Only one process at the root of the tree doesn't really have a parent. This is the "init" process, which has PID 1.

Processes can start other processes using the fork and exec syscalls. When they do this, the new process' parent is the process that called the fork syscall. fork is used to start another copy of the running process and exec is used to start different process. Each process has an entry in the OS process table. This records info about the process' state and exit code. When a child process has finished running, its process table entry remains until the parent process has retrieved its exit code using the wait syscall. This is called "reaping" zombie processes.

Zombie processes are processes that have stopped running but their process table entry still exists because the parent process hasn't retrieved it via the wait syscall. Technically each process that terminates is a zombie for a very short period of time but they could live for longer.

Something like [tini](https://github.com/krallin/tini) or [dumb-init](https://github.com/Yelp/dumb-init) can be used if you have a process that spawns new processes but doesn't have good signal handlers implemented to catch child signals and stop your child if your process should be stopped etc.

Bash scripts for example do NOT handle and emit signals properly.
</blockquote>

If you were to run a container with `docker run`, you can supply the `--init` argument to get a basic `init` for your container. But for other situations, the container entrypoint must put an `init` on PID 1 so child processes can be cleaned up.

> NOTE: If you are using Docker 1.13 or greater, Tini is included in Docker itself. This includes all versions of Docker CE. To enable Tini, just pass the `--init` flag to docker run.

## Changing the Container Entrypoint To An Init

Let's use [tini](https://github.com/krallin/tini) as our `init`.

To add `tini` to the image to be runnable, `tini` must be added to the image. So let's use the suggested base image from `tini`:

```Dockerfile
# Add Tini
ENV TINI_VERSION v0.19.0
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini /tini
RUN chmod +x /tini
ENTRYPOINT ["/tini", "--"]

# Run your program under Tini
CMD ["/your/program", "-and", "-its", "arguments"]
# or docker run your-image /your/program ...
```

After we add this to our base image, we can now configure jib to use `/tini` as the entrypoint.

We're still going to use the [Gradle Jib plugin](https://github.com/GoogleContainerTools/jib/tree/master/jib-gradle-plugin) to build our docker container. The Gradle Jib plugin has a `container.entrypoint` configuration property.

<blockquote>

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `entrypoint` | `List<String>` | None | The command to start the container with (similar to Docker's `ENTRYPOINT` instruction). If set, then `jvmFlags`, `mainClass`, `extraClasspath`, and `expandClasspathDependencies` are ignored. You may also set `jib.container.entrypoint = 'INHERIT'` to indicate that the entrypoint and args should be inherited from the base image.* |
| `args` | `List<String>` | *None* | Additional program arguments appended to the command to start the container (similar to Docker's [CMD](https://docs.docker.com/engine/reference/builder/#cmd) instruction in relation with [ENTRYPOINT](https://docs.docker.com/engine/reference/builder/#entrypoint)). In the default case where you do not set a custom `entrypoint`, this parameter is effectively the arguments to the main method of your Java application. |

\* If you configure args while entrypoint is set to 'INHERIT', the configured args value will take precedence over the CMD propagated from the base image.

</blockquote>

Jib originally used the ENTRYPOINT for the main portion of the java command, and used CMD for just additional arguments, so we should modify the entrypoint to keep consistent.

We can prepend `tini` as the parent process and still use the default Jib entrypoint manually afterwards. Note that `jib.container.jvmFlags` must be flattened since it is itself a list, and entrypoint takes a list of `String`. In Gradle Kotlin DSL:

```kotlin
jib {
    container {
        entrypoint = listOf("/tini", "--", "java") + jib.container.jvmFlags + listOf(
            "-cp",
            "/app/resources:/app/classes:/app/libs/*",
            jib.container.mainClass
        )
```

That's it! Now your container reaps zombie processes, and you can start/stop browser drivers to your heart's content.
