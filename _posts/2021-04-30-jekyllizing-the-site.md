---
layout: post
title: Jekyllizing the Site
---

I recently rewrote my small and barebones github pages website [gwpantazes.github.io](https://gwpantazes.github.io) with [Jekyll](https://jekyllrb.com).

## A Walkthrough of my Past Personal Websites

When I first tried out making a personal website years ago near the end of high school, I used Bootstrap since it was fresh-looking and all the rage at the time. I explored using HTML, CSS, and JS and it was quite fun to figure out how to put images around, try to shape the page (within the confines of bootstrap), and figure out the type of content I would want to put on a website.

Since then my tastes have changed. I lost the hosting on my previous website, switched to github pages, and simplified my website to just a home page and a CV. I find HTML with no sytling pretty charming and funny, so I left it like that for quite a while. And I may yet switch the Jekyll Minima theme to look a lot more unstyled, but for now, I'm starting with what Minima gives me.

In 2019, I began learning React.js to branch out into different skillsets other than just automated testing, and I believed at the time (out of naivete and outa lack of understanding) that I'd use something something like a Gatsby.js and React stack to publish a static website to Github Pages. I thought at the time that this was one of the only ways to get code reuse, e.g. recycling a footer element instead of copy-pasting it around.

But sometime in late 2020 I was reading the Github Pages documentation and paid more attention to the built-in Jekyll support and my mind was blown! There was a static site generator that could do such a thing (with `_includes`). In retrospect, it feels obvious, but at the time I was feeling my mind opening up with thoughts akin to "Wow! So React isn't the only way to do things like components!" as well as "Wow! So sites can be built statically ahead of time so they don't have to render on the client side!" Of course I knew static sites existed; I had published HTML sites plainly before. But React had primed me to believe that anything of sufficient complexity must have been using something which could share and reuse code as components, because copy paste coding is not fun after the initial pasting spree.

Which brings us to now, which might be the 3rd major iteration of what my personal websites have been. We're now on Jekyll, folks. I started "Jekyllizing" the site around February, tinkered with it in some spare evenings, and now that I have a stable experience it's time to publish even it's just barebones Minima theme.

## How's Jekyll?

Jekyll is one of my first times working with a static site generator that wasn't just Javadoc, Checkstyle, or some other Java build tool that outputs HTML. It was interesting to see how layouts and includes worked, how styles are applied, how the shape of the source turns into the target site during the build.

It took my quite a long time of fuddling around to realize something important about Jekyll; to override things, you simply have a file in your own project of the same name. For some reason, this didn't click with me, and I kept trying to reference files that existed within the underlying theme.

For example, one mistake that seemed really gratifying albeit obvious to figure out was that I kept trying to import and reference Minima's SCSS files in my own. After many small experiments and head scratches, I was rubber duck explaining to Kira on a walk when it suddenly came to me that I was treating SCSS as something special, when I already know that overriding happened by copying in the file from the theme. From there, it was smoother sailing.

Now I just have to figure out how to design a website. (Maybe I'll stick to the barebones unstyled HTML out of a sense of satire and inability to design 😜.)

What I'm most looking forward to with Jekyll is:

- Reusing "components" (which in Jekyll are called "includes")
- Built-in Blogging, which I'd like to start doing
- Toying around with the Liquid templating language and getting used to what's possible with templating and static sites

---

This is my first blog post with Jekyll, as well as my first blog post on my personal site, with more to come! Cheers! 🍺
