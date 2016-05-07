task :install do
  sh 'npm install angular'
end

task :clean do
  rm_rf 'dist'
  rm_rf 'public'
end

directory 'public'

task build: ['public'] do
  ln_sf '../node_modules', 'public/vendor'
  sh './build.rb'
end

task serve: [:build] do
  sh './build.rb --serve' 
end

task :package do
  url = %x(git config --get remote.origin.url).chomp
  sha = %x(git rev-parse --verify HEAD).chomp

  FileUtils.rm_rf 'dist' unless File.exists?('dist/.git')
  sh "git clone #{url} dist" unless File.exists?('dist')
  Dir.chdir('dist') do
    sh 'git checkout gh-pages'
    sh 'git rm -rf *'
  end
  sh './build.rb --dist'
  Dir.chdir('dist') do
    sh 'git add .'
    sh "git commit -m 'Deploy to Github Pages: #{sha}'"
    sh "git push origin -u gh-pages"
  end
end


require 'jasmine'
load 'jasmine/tasks/jasmine.rake'
