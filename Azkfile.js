/**
 * Documentation: http://docs.azk.io/Azkfile.js
 */

// Adds the systems that shape your system
systems({
  speakerthumbs: {
    // Dependent systems
    depends: ["mongodb"],
    // More images:  http://images.azk.io
    image: {"docker": "azukiapp/node:0.12"},
    // Steps to execute before running instances
    provision: [
      "npm install",
    ],
    workdir: "/azk/#{manifest.dir}",
    shell: "/bin/bash",
    command: "npm start",
    wait: {"retry": 20, "timeout": 1000},
    mounts: {
      '/azk/#{manifest.dir}': path("."),
    },
    scalable: {"default": 1},
    http: {
      domains: [ "#{system.name}.#{azk.default_domain}" ]
    },
    envs: {
      // set instances variables
      NODE_ENV: "dev",
      AZK_HOST: "#{system.name}.#{azk.default_domain}"
    },
  },
  mongodb: {
    image: { "docker": "azukiapp/mongodb" },
    command : 'mongod --rest --httpinterface',
    scalable: false,
    ports: {
      http: "28017:28017/tcp",
    },
    http: {
      domains: [ "#{manifest.dir}-#{system.name}.#{azk.default_domain}" ],
    },
    mounts: {
      '/data/db': persistent('mongodb-#{manifest.dir}'),
    },
    wait: { "retry": 20, "timeout": 1000},
    export_envs: {
      MONGODB_URL: "mongodb://#{net.host}:#{net.port[27017]}/#{manifest.dir}_development",
    },
  }
});



