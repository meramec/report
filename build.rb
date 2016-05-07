#!/usr/bin/env ruby

require 'haml'
require 'listen'
require 'fileutils'
require 'webrick'

$dist = ARGV.first == '--dist'
$serve =  ARGV.first == '--serve'

$source = File.absolute_path 'app'
$dest = $dist ? 'dist' : 'public'

class Output
  def initialize(input, output)
    @input, @output = input, output
  end
  def create!
    FileUtils.mkdir_p File.dirname(@output)
    create_command
  end
  def remove!
    FileUtils.rm_f @output
  end
  def to_s
    @output
  end
  def self.make(input)
    case input
    when /\.haml$/
      Html.new input
    when /\.sass$/
      Sass.new input
    when /\.js$/
      Javascript.new input
    end
  end
end

class Html < Output
  Haml::Options.defaults[:format] = :html5

  def initialize(input)
    super input, File.join($dest, input.sub(File.join($source, ''), '').sub(/\.haml$/, ''))
  end

  protected
  def create_command
    File.open(@output, 'w') do |f|
      f.write Haml::Engine.new(File.read(@input)).render self
    end
  end

  def css_include(file)
    Haml::Engine.new("%link{ rel: 'stylesheet', type: 'text/css', href: '#{file}'}").render
  end

  def js_include(file)
    Haml::Engine.new("%script{ src: '#{file}'}").render
  end
  def js_include_tree(dir)
    Dir[File.join($dest, dir, '**', '*.js')].map do |file|
      js_include file.sub File.join($dest, ''), ''
    end.join
  end

end

class Sass < Output
  APPLICATION_CSS = File.join $dest, 'stylesheets', 'application.css'
  @@cleaned = false

  def initialize(input)
    super input, APPLICATION_CSS
  end

  protected
  def create_command
    remove! unless @@cleaned
    @@cleaned = true

    File.open(@output, 'a') do |f|
      f.puts "/* #{@input} */"
      f.write %x(sass #{@input})
      f.puts
    end
  end
end

class Javascript < Output
  APPLICATION_JS = File.join $dest, 'js', 'application.js'
  @@cleaned = false

  def initialize(input)
    output = $dist ? APPLICATION_JS : File.join($dest, 'js', input.sub(File.join($source, 'js', ''), ''))
    super input, output
  end

  protected
  def create_command
    remove! unless @@cleaned
    @@cleaned = true

    File.open(@output, $dist ? 'a' : 'w') do |f|
      f.puts "// #{@input}" if $dist
      f.write File.read(@input) 
      f.puts if $dist
    end
  end
end

def report(type, input, output)
  puts <<-eos
  #{File.extname(output.to_s).upcase} #{type} @ #{Time.now.strftime("%F %T")}:
  - from: #{input}
  - to: #{output}
  eos
end

def ordered(files)
  files.partition {|f| File.extname(f) != '.haml'}.flatten
end

update = ->(modified, added, removed) do
  ordered(added + modified).each do |input|
    if output = Output.make(input)
      output.create!
      report 'generated', input, output
    end
  end

  ordered(removed).each do |input|
    if output = Output.make(input)
      output.remove!
      report 'removed', input, output
    end
  end
end

if $serve
  puts "Watching #{$source}"
  listener = Listen.to($source, :filter => /\.(haml|sass|js)$/, &update)
  listener.start

  puts 'Starting server on port 8080'
  server = WEBrick::HTTPServer.new Port: 8080
  server.mount '/', WEBrick::HTTPServlet::FileHandler, $dest
  trap('INT') { server.stop }
  server.start
else
  puts "Updating #{$source}"
  update[Dir[File.join($source, '**/*.{haml,sass,js}')], [], []]
end

