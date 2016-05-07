task :install do
  sh 'sudo npm install jitsu -g'
  sh 'jitsu install http-server'
end

task :clean do
  rm_rf 'dist'
  rm_rf 'public'
end

directory 'public'

task build: ['public'] do
  ln_sf '../app/js', 'public/js'
  ln_sf '../node_modules', 'public/vendor'
  system './build.rb'
end

task start: [:build] do
  exec './build.rb --serve' 
end

directory 'dist'

task package: ['dist'] do

end

require 'jasmine'
load 'jasmine/tasks/jasmine.rake'
