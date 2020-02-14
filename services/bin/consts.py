USE_STATIC = False

HOSTS = {
      "hosts": [
        {
          "name":"Node-A",
          "ip": "10.2.161.42",
          "ipmi_ip": "10.2.129.68",
          "uuid": "1234",
          "username": "ADMIN",
        },
        {
          "name":"Node-B",
          "ip": "10.2.161.43",
          "ipmi_ip": "10.2.129.69",
          "uuid": "2341",
          "username": "ADMIN",
        },
        {
          "name":"Node-C",
          "ip": "10.2.161.44",
          "ipmi_ip": "10.2.129.70",
          "uuid": "3412",
          "username": "ADMIN",
        },
        {
          "name":"Node-D",
          "ip": "10.2.161.45",
          "ipmi_ip": "10.2.129.71",
          "uuid": "4123",
          "username": "ADMIN",
        }
      ]
}

COMPONENTS = {
  "components": {
    "bios": [
      {
        "manufacturer": "Nutanix", 
        "model": "NX-TDT-4NL3-G7", 
        "serial": "S319237X8834683", 
        "version": "PB42.300"
      }
    ], 
    "bmc": [
      {
        "health": "OK", 
        "model": "ASPEED", 
        "state": "Enabled", 
        "version": "9.08.05 beta"
      }
    ], 
    "cpu": [
      {
        "cores": 16, 
        "health": "OK", 
        "manufacturer": "Intel(R) Corporation", 
        "model": "Intel(R) Xeon(R) Gold 5218 CPU @ 2.30GHz", 
        "name": "CPU1", 
        "state": "Enabled", 
        "temperature": 45, 
        "threads": 32
      }, 
      {
        "cores": 16, 
        "health": "OK", 
        "manufacturer": "Intel(R) Corporation", 
        "model": "Intel(R) Xeon(R) Gold 5218 CPU @ 2.30GHz", 
        "name": "CPU2", 
        "state": "Enabled", 
        "temperature": 56, 
        "threads": 32
      }
    ], 
    "fan": [
      {
        "health": "OK", 
        "name": "FAN1", 
        "rpm": 7000, 
        "state": "Enabled"
      }, 
      {
        "health": "OK", 
        "name": "FAN2", 
        "rpm": 7000, 
        "state": "Enabled"
      }
    ]
  }
}
