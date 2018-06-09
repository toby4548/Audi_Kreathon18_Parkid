# Audi Kreathon18 Parkid

The source code for team Parkid at Audi Kreathon 2018

![parkid](img/parkid.PNG)

## Demo v1 - 1 parkspace detected with Johnny-five:

Arduino: standart Firmata

## Demo v2 - 1 parkspace detected with Serialport:

Arduino: park_test_serial

## Demo v3 - 2 parkspace detected with Serialport:

Arduino: park_test_serial

## Demo v4 - Workflow demo without interface

Arduino: park_test_serial
Format:

```json
{
  "carID": "FF FF FF FF",
  "occupied": [
    0,
    ......,
    0
  ],
  "check": 0,
  "check_car": 0
}
```
