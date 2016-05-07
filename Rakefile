task :install do
  sh 'sudo npm install jitsu -g'
  sh 'jitsu install http-server'
end

directory 'public'

task start: ['public'] do
  ln_sf '../app/js', 'public/js'
  ln_sf '../node_modules', 'public/vendor'
  exec './live-server.rb' 
end

require 'jasmine'
load 'jasmine/tasks/jasmine.rake'
