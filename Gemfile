source "https://rubygems.org"

# Run `bundle install` to install the gems declared in this Gemfile.
# Run Jekyll with `bundle exec`, like so: bundle exec jekyll serve

gem "minima", '~> 2.5', '>= 2.5.1'

# To upgrade, run `bundle update github-pages`.
gem "github-pages", group: :jekyll_plugins

# If you have any plugins, put them here!
group :jekyll_plugins do
  gem "jekyll-feed", "~> 0.6"
end

# Windows does not include zoneinfo files, so bundle the tzinfo-data gem
# and associated library.
install_if -> { RUBY_PLATFORM =~ %r!mingw|mswin|java! } do
  gem "tzinfo", "~> 1.2"
  gem "tzinfo-data"
end

# Performance-booster for watching directories on Windows
gem "wdm", "~> 0.1.0", :install_if => Gem.win_platform?

gem "rexml", ">= 3.2.5"
gem "kramdown", ">= 2.3.1"

# kramdown v2 ships without the gfm parser by default. If you're using
# kramdown v1, comment out this line.
gem "kramdown-parser-gfm"
