#!/usr/bin/env ruby

require 'listen'
require 'optparse'
require 'fileutils'
require 'webrick'

$source = File.absolute_path 'app'
$dest = 'public'

class Input
  def initialize(input)
    @input = input
  end
  def get_output
    case @input
    when /\.haml$/
      haml
    when /\.sass$/
      sass
    end.tap do |output|
      def output.remove!
        FileUtils.rm_f self
      end if output
    end
  end
  def haml
    File.join($dest, @input.sub(File.join($source, ''), '').sub(/\.haml$/, '')).tap do |output|
      input = @input
      output.define_singleton_method(:create!) do
        FileUtils.mkdir_p File.dirname(output)
        %x(haml #{input} #{self} --format html5 --double-quote-attributes --no-escape-attrs)
      end
    end
  end
  def sass
    File.join($dest, 'stylesheets', @input.sub(File.join($source, 'sass', ''), '').sub(/\.sass$/, '.css')).tap do |output|
      input = @input
      output.define_singleton_method(:create!) do
        FileUtils.mkdir_p File.dirname(output)
        %x(sass #{input} #{self})
      end
    end
  end
end

def report(type, input, output)
  puts <<-eos
  #{File.extname(output).upcase} #{type} @ #{Time.now.strftime("%F %T")}:
  - from: #{input}
  - to: #{output}
  eos
end

update = ->(modified, added, removed) do
  (added + modified).each do |input|
    if output = Input.new(input).get_output
      output.create!
      report 'generated', input, output
    end
  end

  removed.each do |input|
    if output = Input.new(input).get_output
      output.remove!
      report 'removed', input, output
    end
  end
end

if ARGV.first == '--serve'
  puts "Watching #{$source}"
  listener = Listen.to($source, :filter => /\.(haml|sass)$/, &update)
  listener.start

  puts 'Starting server on port 8080'
  server = WEBrick::HTTPServer.new Port: 8080
  server.mount '/', WEBrick::HTTPServlet::FileHandler, $dest
  trap('INT') { server.stop }
  server.start

else
  puts "Updating #{$source}"
  update[Dir[File.join($source, '**/*.{haml,sass}')], [], []]
end

