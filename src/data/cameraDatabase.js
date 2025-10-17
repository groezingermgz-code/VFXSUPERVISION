import { useState } from 'react';

export const cameraDatabase = {
  "ARRI": {
    models: {
      "ALEXA 35": {
        formats: [
          "4.6K 3:2 Open Gate",
          "4.6K 16:9",
          "4K 16:9",
          "4K 2:1",
          "3.8K 16:9",
          "3.3K 6:5",
          "3K 1:1",
          "2.7K 8:9",
          "2K 16:9 S16"
        ],
        codecs: ["ARRI RAW", "ProRes 4444 XQ", "ProRes 4444", "ProRes 422 HQ", "ProRes 422"],
        sensorSizes: {
          "4.6K 3:2 Open Gate": "28.0 x 19.2 mm",
          "4.6K 16:9": "28.0 x 15.7 mm",
          "4K 16:9": "24.9 x 14.0 mm",
          "3.8K 16:9": "23.3 x 13.1 mm",
          // Ergänzt: mm-Werte für 3.3K 6:5 (entspricht Xtreme)
          "3.3K 6:5": "20.22 x 16.95 mm",
          // Optional: mm-Werte für S16-Format (aus Xtreme übernommen)
          "2K 16:9 S16": "12.4 x 7.0 mm"
        },
        pixelResolutions: {
          "4.6K 3:2 Open Gate": "4608 x 3164",
          "4.6K 16:9": "4608 x 2592",
          "4K 16:9": "4096 x 2304",
          "4K 2:1": "4096 x 2048",
          "3.8K 16:9": "3840 x 2160",
          "3.3K 6:5": "3328 x 2790",
          "3K 1:1": "3072 x 3072",
          "2.7K 8:9": "2743 x 3086",
          "2K 16:9 S16": "2048 x 1152"
        },
        aspectRatios: {
          "4.6K 3:2 Open Gate": { recorded: "3:2", sensor: "3:2" },
          "4.6K 16:9": { recorded: "16:9", sensor: "16:9" },
          "4K 16:9": { recorded: "16:9", sensor: "16:9" },
          "4K 2:1": { recorded: "2:1", sensor: "2:1" },
          "3.8K 16:9": { recorded: "16:9", sensor: "16:9" },
          "3.3K 6:5": { recorded: "6:5", sensor: "6:5" },
          "3K 1:1": { recorded: "1:1", sensor: "1:1" },
          "2.7K 8:9": { recorded: "8:9", sensor: "8:9" },
          "2K 16:9 S16": { recorded: "16:9", sensor: "16:9" }
        }
      },
      "ALEXA 35 Xtreme": {
        formats: [
          "4.6K 3:2 Open Gate",
          "4.6K 16:9",
          "4K 16:9",
          "3.8K 16:9",
          "3.8K 2.39:1",
          "3.3K 6:5",
          "2K 16:9 S16",
          "HD 16:9 S16"
        ],
        codecs: ["ARRI RAW", "ProRes 4444 XQ", "ProRes 4444", "ProRes 422 HQ", "ProRes 422", "ARRICORE"],
        sensorSizes: {
          "4.6K 3:2 Open Gate": "28.0 x 19.2 mm",
          "4.6K 16:9": "28.0 x 15.7 mm",
          "4K 16:9": "24.9 x 14.0 mm",
          "3.8K 16:9": "23.3 x 13.1 mm",
          "3.8K 2.39:1": "23.3 x 9.8 mm",
          "3.3K 6:5": "20.22 x 16.95 mm",
          "2K 16:9 S16": "12.4 x 7.0 mm",
          "HD 16:9 S16": "11.7 x 6.6 mm"
        },
        pixelResolutions: {
          "4.6K 3:2 Open Gate": "4608 x 3164",
          "4.6K 16:9": "4608 x 2592",
          "4K 16:9": "4096 x 2304",
          "3.8K 16:9": "3840 x 2160",
          "3.8K 2.39:1": "3840 x 1608",
          "3.3K 6:5": "3328 x 2790",
          "2K 16:9 S16": "2048 x 1152",
          "HD 16:9 S16": "1920 x 1080"
        },
        aspectRatios: {
          "4.6K 3:2 Open Gate": { recorded: "3:2", sensor: "3:2" },
          "4.6K 16:9": { recorded: "16:9", sensor: "16:9" },
          "4K 16:9": { recorded: "16:9", sensor: "16:9" },
          "3.8K 16:9": { recorded: "16:9", sensor: "16:9" },
          "3.8K 2.39:1": { recorded: "2.39:1", sensor: "2.39:1" },
          "3.3K 6:5": { recorded: "6:5", sensor: "6:5" },
          "2K 16:9 S16": { recorded: "16:9", sensor: "16:9" },
          "HD 16:9 S16": { recorded: "16:9", sensor: "16:9" }
        }
      },
      "ALEXA Mini LF": {
        formats: [
          "4.5K LF 3:2 Open Gate",
          "4.5K LF 2.39:1",
          "4.3K LF 16:9",
          "3.8K LF 16:9",
          "2.8K LF 1:1",
          "3.4K S35 3:2",
          "3.2K S35 16:9",
          "2.8K S35 4:3",
          "2.8K S35 16:9"
        ],
        codecs: ["ARRI RAW", "ProRes 4444 XQ", "ProRes 4444", "ProRes 422 HQ", "ProRes 422"],
        sensorSizes: {
          "4.5K LF 3:2 Open Gate": "36.70 x 25.54 mm",
          "4.5K LF 2.39:1": "36.70 x 15.31 mm",
          "4.3K LF 16:9": "35.64 x 20.05 mm",
          "3.8K LF 16:9": "31.68 x 17.82 mm",
          "2.8K LF 1:1": "23.76 x 23.76 mm",
          "3.4K S35 3:2": "28.25 x 18.16 mm",
          "3.2K S35 16:9": "26.40 x 14.85 mm",
          "2.8K S35 4:3": "23.76 x 17.81 mm",
          "2.8K S35 16:9": "23.76 x 13.36 mm"
        },
        pixelResolutions: {
          "4.5K LF 3:2 Open Gate": "4448 x 3096",
          "4.5K LF 2.39:1": "4448 x 1856",
          "4.3K LF 16:9": "4320 x 2430",
          "3.8K LF 16:9": "3840 x 2160",
          "2.8K LF 1:1": "2880 x 2880",
          "3.4K S35 3:2": "3424 x 2202",
          "3.2K S35 16:9": "3200 x 1800",
          "2.8K S35 4:3": "2880 x 2160",
          "2.8K S35 16:9": "2880 x 1620"
        },
        aspectRatios: {
          "4.5K LF 3:2 Open Gate": { recorded: "3:2", sensor: "3:2" },
          "4.5K LF 2.39:1": { recorded: "2.39:1", sensor: "2.39:1" },
          "4.3K LF 16:9": { recorded: "16:9", sensor: "16:9" },
          "3.8K LF 16:9": { recorded: "16:9", sensor: "16:9" },
          "2.8K LF 1:1": { recorded: "1:1", sensor: "1:1" },
          "3.4K S35 3:2": { recorded: "3:2", sensor: "3:2" },
          "3.2K S35 16:9": { recorded: "16:9", sensor: "16:9" },
          "2.8K S35 4:3": { recorded: "4:3", sensor: "4:3" },
          "2.8K S35 16:9": { recorded: "16:9", sensor: "16:9" }
        }
      },
      "ALEXA LF": {
        formats: [
          "4.5K LF 3:2 Open Gate",
          "4.3K LF 16:9",
          "4.5K LF 2.39:1"
        ],
        codecs: ["ARRI RAW", "ProRes 4444 XQ", "ProRes 4444", "ProRes 422 HQ", "ProRes 422"],
        sensorSizes: {
          "4.5K LF 3:2 Open Gate": "36.70 x 25.54 mm",
          "4.3K LF 16:9": "31.68 x 17.82 mm",
          "4.5K LF 2.39:1": "36.70 x 15.31 mm"
        },
        pixelResolutions: {
          "4.5K LF 3:2 Open Gate": "4448 x 3096",
          "4.3K LF 16:9": "3840 x 2160",
          "4.5K LF 2.39:1": "4448 x 1856"
        },
        aspectRatios: {
          "4.5K LF 3:2 Open Gate": { recorded: "3:2", sensor: "3:2" },
          "4.3K LF 16:9": { recorded: "16:9", sensor: "16:9" },
          "4.5K LF 2.39:1": { recorded: "2.39:1", sensor: "2.39:1" }
        }
      },
      "ALEXA Mini": {
        formats: ["3.4K", "UHD", "2K", "HD"],
        codecs: ["ARRI RAW", "ProRes 4444 XQ", "ProRes 4444", "ProRes 422 HQ", "ProRes 422"],
        sensorSizes: {
          "3.4K": "23.76 x 13.37 mm",
          "UHD": "23.76 x 13.37 mm",
          "2K": "23.76 x 13.37 mm",
          "HD": "23.76 x 13.37 mm"
        },
        pixelResolutions: {
          "3.4K": "3424 x 1926",
          "UHD": "3840 x 2160",
          "2K": "2048 x 1152",
          "HD": "1920 x 1080"
        },
        aspectRatios: {
          "3.4K": {
            recorded: "16:9",
            sensor: "16:9"
          },
          "UHD": {
            recorded: "16:9",
            sensor: "16:9"
          },
          "2K": {
            recorded: "16:9",
            sensor: "16:9"
          },
          "HD": {
            recorded: "16:9",
            sensor: "16:9"
          }
        }
      },
      "ALEXA SXT": {
        formats: ["3.4K", "2K", "HD"],
        codecs: ["ARRI RAW", "ProRes 4444 XQ", "ProRes 4444", "ProRes 422 HQ", "ProRes 422"],
        sensorSizes: {
          "3.4K": "23.76 x 13.37 mm",
          "2K": "23.76 x 13.37 mm",
          "HD": "23.76 x 13.37 mm"
        },
        pixelResolutions: {
          "3.4K": "3424 x 1926",
          "2K": "2048 x 1152",
          "HD": "1920 x 1080"
        },
        aspectRatios: {
          "3.4K": {
            recorded: "16:9",
            sensor: "16:9"
          },
          "2K": {
            recorded: "16:9",
            sensor: "16:9"
          },
          "HD": {
            recorded: "16:9",
            sensor: "16:9"
          }
        }
      },
      "AMIRA": {
        formats: ["UHD", "2K", "HD"],
        codecs: ["ProRes 4444 XQ", "ProRes 4444", "ProRes 422 HQ", "ProRes 422", "DNxHD"],
        sensorSizes: {
          "UHD": "23.76 x 13.37 mm",
          "2K": "23.76 x 13.37 mm",
          "HD": "23.76 x 13.37 mm"
        },
        pixelResolutions: {
          "UHD": "3840 x 2160",
          "2K": "2048 x 1152",
          "HD": "1920 x 1080"
        },
        aspectRatios: {
          "UHD": {
            recorded: "16:9",
            sensor: "16:9"
          },
          "2K": {
            recorded: "16:9",
            sensor: "16:9"
          },
          "HD": {
            recorded: "16:9",
            sensor: "16:9"
          }
        }
      },
    }
  },
  "RED": {
    models: {
      "V-RAPTOR": {
        formats: ["8K FF", "6K S35", "4K S35", "2K S35"],
        codecs: ["RED RAW (.R3D)", "ProRes 422 HQ", "ProRes 422"],
        sensorSizes: {
          "8K FF": "40.96 x 21.60 mm",
          "6K S35": "23.10 x 12.29 mm",
          "4K S35": "23.10 x 12.29 mm",
          "2K S35": "23.10 x 12.29 mm"
        },
        pixelResolutions: {
          "8K FF": "8192 x 4320",
          "6K S35": "6144 x 3240",
          "4K S35": "4096 x 2160",
          "2K S35": "2048 x 1080"
        },
        aspectRatios: {
          "8K FF": {
            recorded: "17:9",
            sensor: "17:9"
          },
          "6K S35": {
            recorded: "17:9",
            sensor: "17:9"
          },
          "4K S35": {
            recorded: "17:9",
            sensor: "17:9"
          },
          "2K S35": {
            recorded: "17:9",
            sensor: "17:9"
          }
        }
      },
      "V-RAPTOR 8K VV": {
        formats: ["8K FF", "6K S35", "4K S35", "2K S35"],
        codecs: ["REDCODE RAW", "ProRes 422 HQ", "ProRes 422"],
        sensorSizes: {
          "8K FF": "40.96 x 21.60 mm",
          "6K S35": "23.10 x 12.29 mm",
          "4K S35": "23.10 x 12.29 mm",
          "2K S35": "23.10 x 12.29 mm"
        },
        pixelResolutions: {
          "8K FF": "8192 x 4320",
          "6K S35": "6144 x 3240",
          "4K S35": "4096 x 2160",
          "2K S35": "2048 x 1080"
        },
        aspectRatios: {
          "8K FF": {
            recorded: "17:9",
            sensor: "17:9"
          },
          "6K S35": {
            recorded: "17:9",
            sensor: "17:9"
          },
          "4K S35": {
            recorded: "17:9",
            sensor: "17:9"
          },
          "2K S35": {
            recorded: "17:9",
            sensor: "17:9"
          }
        }
      },
      "DSMC3 RED RANGER MONSTRO 8K VV": {
        formats: ["8K FF", "6K S35", "4K S35", "2K S35"],
        codecs: ["RED RAW (.R3D)", "ProRes 422 HQ", "ProRes 422"],
        sensorSizes: {
          "8K FF": "40.96 x 21.60 mm",
          "6K S35": "23.10 x 12.29 mm",
          "4K S35": "23.10 x 12.29 mm",
          "2K S35": "23.10 x 12.29 mm"
        },
        pixelResolutions: {
          "8K FF": "8192 x 4320",
          "6K S35": "6144 x 3240",
          "4K S35": "4096 x 2160",
          "2K S35": "2048 x 1080"
        },
        aspectRatios: {
          "8K FF": {
            recorded: "17:9",
            sensor: "17:9"
          },
          "6K S35": {
            recorded: "17:9",
            sensor: "17:9"
          },
          "4K S35": {
            recorded: "17:9",
            sensor: "17:9"
          },
          "2K S35": {
            recorded: "17:9",
            sensor: "17:9"
          }
        }
      },
      "KOMODO": {
        formats: ["6K", "5K", "4K", "3K", "2K"],
        codecs: ["REDCODE RAW", "ProRes 422 HQ", "ProRes 422"],
        sensorSizes: {
          "6K": "27.03 x 14.26 mm",
          "5K": "27.03 x 14.26 mm",
          "4K": "21.60 x 11.40 mm",
          "3K": "16.20 x 8.55 mm",
          "2K": "10.80 x 5.70 mm"
        },
        pixelResolutions: {
          "6K": "6144 x 3240",
          "5K": "5120 x 2700",
          "4K": "4096 x 2160",
          "3K": "3072 x 1620",
          "2K": "2048 x 1080"
        },
        aspectRatios: {
          "6K": {
            recorded: "16:9",
            sensor: "1.9:1"
          },
          "5K": {
            recorded: "16:9",
            sensor: "1.9:1"
          },
          "4K": {
            recorded: "16:9",
            sensor: "1.9:1"
          },
          "3K": {
            recorded: "16:9",
            sensor: "1.9:1"
          },
          "2K": {
            recorded: "16:9",
            sensor: "1.9:1"
          }
        }
      },
      "GEMINI 5K S35": {
        formats: ["5K S35", "4K S35", "2K S35"],
        codecs: ["RED RAW (.R3D)", "ProRes 422 HQ", "ProRes 422"],
        sensorSizes: {
          "5K S35": "24.89 x 14.00 mm",
          "4K S35": "24.89 x 14.00 mm",
          "2K S35": "24.89 x 14.00 mm"
        },
        pixelResolutions: {
          "5K S35": "5120 x 2700",
          "4K S35": "4096 x 2160",
          "2K S35": "2048 x 1080"
        },
        aspectRatios: {
          "5K S35": {
            recorded: "17:9",
            sensor: "17:9"
          },
          "4K S35": {
            recorded: "17:9",
            sensor: "17:9"
          },
          "2K S35": {
            recorded: "17:9",
            sensor: "17:9"
          }
        }
      },
      "KOMODO-X": {
        formats: ["6K", "5K", "4K", "3K", "2K"],
        codecs: ["REDCODE RAW", "ProRes 422 HQ", "ProRes 422"],
        sensorSizes: {
          "6K": "27.03 x 14.26 mm",
          "5K": "27.03 x 14.26 mm",
          "4K": "21.60 x 11.40 mm",
          "3K": "16.20 x 8.55 mm",
          "2K": "10.80 x 5.70 mm"
        },
        pixelResolutions: {
          "6K": "6144 x 3240",
          "5K": "5120 x 2700",
          "4K": "4096 x 2160",
          "3K": "3072 x 1620",
          "2K": "2048 x 1080"
        },
        aspectRatios: {
          "6K": { recorded: "16:9", sensor: "1.9:1" },
          "5K": { recorded: "16:9", sensor: "1.9:1" },
          "4K": { recorded: "16:9", sensor: "1.9:1" },
          "3K": { recorded: "16:9", sensor: "1.9:1" },
          "2K": { recorded: "16:9", sensor: "1.9:1" }
        }
      },
      "V-RAPTOR XL 8K VV": {
        formats: ["8K FF", "6K S35", "4K S35", "2K S35"],
        codecs: ["REDCODE RAW", "ProRes 422 HQ", "ProRes 422"],
        sensorSizes: {
          "8K FF": "40.96 x 21.60 mm",
          "6K S35": "23.10 x 12.29 mm",
          "4K S35": "23.10 x 12.29 mm",
          "2K S35": "23.10 x 12.29 mm"
        },
        pixelResolutions: {
          "8K FF": "8192 x 4320",
          "6K S35": "6144 x 3240",
          "4K S35": "4096 x 2160",
          "2K S35": "2048 x 1080"
        },
        aspectRatios: {
          "8K FF": { recorded: "17:9", sensor: "17:9" },
          "6K S35": { recorded: "17:9", sensor: "17:9" },
          "4K S35": { recorded: "17:9", sensor: "17:9" },
          "2K S35": { recorded: "17:9", sensor: "17:9" }
        }
      }
    }
  },
  "Kinefinity": {
    models: {
      "MAVO Edge 6K": {
        formats: ["6K 3:2 Open Gate", "6K 17:9", "4K DCI", "4K UHD"],
        codecs: ["ProRes 4444 XQ", "ProRes 4444", "ProRes 422 HQ", "ProRes 422", "ProRes 422 LT", "CinemaDNG"],
        sensorSizes: {
          "6K 3:2 Open Gate": "36.00 x 24.00 mm",
          "6K 17:9": "36.00 x 21.60 mm",
          "4K DCI": "23.10 x 12.99 mm",
          "4K UHD": "23.10 x 12.99 mm"
        },
        pixelResolutions: {
          "6K 3:2 Open Gate": "6016 x 3984",
          "6K 17:9": "6016 x 3172",
          "4K DCI": "4096 x 2160",
          "4K UHD": "3840 x 2160"
        },
        aspectRatios: {
          "6K 3:2 Open Gate": { recorded: "3:2", sensor: "3:2" },
          "6K 17:9": { recorded: "17:9", sensor: "17:9" },
          "4K DCI": { recorded: "17:9", sensor: "17:9" },
          "4K UHD": { recorded: "16:9", sensor: "17:9" }
        }
      },
      "MAVO Edge 8K": {
        formats: ["8K 3:2 Open Gate", "8K 17:9", "8K 2.39:1", "4K DCI", "4K UHD"],
        codecs: ["ProRes 4444 XQ", "ProRes 4444", "ProRes 422 HQ", "ProRes 422", "ProRes 422 LT"],
        sensorSizes: {
          "8K 3:2 Open Gate": "36.00 x 24.00 mm",
          "8K 17:9": "36.00 x 21.60 mm",
          "8K 2.39:1": "36.00 x 15.10 mm",
          "4K DCI": "23.10 x 12.99 mm",
          "4K UHD": "23.10 x 12.99 mm"
        },
        pixelResolutions: {
          "8K 3:2 Open Gate": "8192 x 5288",
          "8K 17:9": "8192 x 4320",
          "8K 2.39:1": "8192 x 3424",
          "4K DCI": "4096 x 2160",
          "4K UHD": "3840 x 2160"
        },
        aspectRatios: {
          "8K 3:2 Open Gate": { recorded: "3:2", sensor: "3:2" },
          "8K 17:9": { recorded: "17:9", sensor: "17:9" },
          "8K 2.39:1": { recorded: "2.39:1", sensor: "2.39:1" },
          "4K DCI": { recorded: "17:9", sensor: "17:9" },
          "4K UHD": { recorded: "16:9", sensor: "17:9" }
        }
      }
    }
  },
  "Blackmagic Design": {
    models: {
      "URSA Mini Pro 12K": {
        formats: ["12K", "8K", "4K DCI", "4K UHD", "2K", "HD"],
        codecs: ["Blackmagic RAW", "ProRes 422 HQ", "ProRes 422", "DNxHR"],
        sensorSizes: {
          "12K": "35.64 x 23.32 mm",
          "8K": "35.64 x 23.32 mm",
          "4K DCI": "35.64 x 23.32 mm",
          "4K UHD": "35.64 x 23.32 mm",
          "2K": "35.64 x 23.32 mm",
          "HD": "35.64 x 23.32 mm"
        },
        pixelResolutions: {
          "12K": "12288 x 6480",
          "8K": "8192 x 4320",
          "4K DCI": "4096 x 2160",
          "4K UHD": "3840 x 2160",
          "2K": "2048 x 1080",
          "HD": "1920 x 1080"
        },
        aspectRatios: {
          "12K": {
            recorded: "17:9",
            sensor: "1.53:1"
          },
          "8K": {
            recorded: "17:9",
            sensor: "1.53:1"
          },
          "4K DCI": {
            recorded: "17:9",
            sensor: "1.53:1"
          },
          "4K UHD": {
            recorded: "16:9",
            sensor: "1.53:1"
          },
          "2K": {
            recorded: "17:9",
            sensor: "1.53:1"
          },
          "HD": {
            recorded: "16:9",
            sensor: "1.53:1"
          }
        }
      },
      "URSA Mini Pro 4.6K G2": {
        formats: ["4.6K", "4K DCI", "4K UHD", "2K", "HD"],
        codecs: ["Blackmagic RAW", "ProRes 422 HQ", "ProRes 422", "DNxHR"],
        sensorSizes: {
          "4.6K": "25.34 x 14.25 mm",
          "4K DCI": "25.34 x 14.25 mm",
          "4K UHD": "25.34 x 14.25 mm",
          "2K": "25.34 x 14.25 mm",
          "HD": "25.34 x 14.25 mm"
        },
        pixelResolutions: {
          "4.6K": "4608 x 2592",
          "4K DCI": "4096 x 2160",
          "4K UHD": "3840 x 2160",
          "2K": "2048 x 1080",
          "HD": "1920 x 1080"
        },
        aspectRatios: {
          "4.6K": {
            recorded: "16:9",
            sensor: "16:9"
          },
          "4K DCI": {
            recorded: "17:9",
            sensor: "16:9"
          },
          "4K UHD": {
            recorded: "16:9",
            sensor: "16:9"
          },
          "2K": {
            recorded: "17:9",
            sensor: "16:9"
          },
          "HD": {
            recorded: "16:9",
            sensor: "16:9"
          }
        }
      },
      "Pocket Cinema Camera 6K Pro": {
        formats: ["6K", "4K DCI", "4K UHD", "2K", "HD"],
        codecs: ["Blackmagic RAW", "ProRes 422 HQ", "ProRes 422"],
        sensorSizes: {
          "6K": "23.10 x 12.99 mm",
          "4K DCI": "23.10 x 12.99 mm",
          "4K UHD": "23.10 x 12.99 mm",
          "2K": "23.10 x 12.99 mm",
          "HD": "23.10 x 12.99 mm"
        },
        pixelResolutions: {
          "6K": "6144 x 3456",
          "4K DCI": "4096 x 2160",
          "4K UHD": "3840 x 2160",
          "2K": "2048 x 1080",
          "HD": "1920 x 1080"
        },
        aspectRatios: {
          "6K": {
            recorded: "16:9",
            sensor: "16:9"
          },
          "4K DCI": {
            recorded: "17:9",
            sensor: "16:9"
          },
          "4K UHD": {
            recorded: "16:9",
            sensor: "16:9"
          },
          "2K": {
            recorded: "17:9",
            sensor: "16:9"
          },
          "HD": {
            recorded: "16:9",
            sensor: "16:9"
          }
        }
      },
      "Pocket Cinema Camera 6K": {
        formats: ["6K", "4K DCI", "4K UHD", "2K", "HD"],
        codecs: ["Blackmagic RAW", "ProRes 422 HQ", "ProRes 422"],
        sensorSizes: {
          "6K": "23.10 x 12.99 mm",
          "4K DCI": "23.10 x 12.99 mm",
          "4K UHD": "23.10 x 12.99 mm",
          "2K": "23.10 x 12.99 mm",
          "HD": "23.10 x 12.99 mm"
        },
        pixelResolutions: {
          "6K": "6144 x 3456",
          "4K DCI": "4096 x 2160",
          "4K UHD": "3840 x 2160",
          "2K": "2048 x 1080",
          "HD": "1920 x 1080"
        },
        aspectRatios: {
          "6K": {
            recorded: "16:9",
            sensor: "16:9"
          },
          "4K DCI": {
            recorded: "17:9",
            sensor: "16:9"
          },
          "4K UHD": {
            recorded: "16:9",
            sensor: "16:9"
          },
          "2K": {
            recorded: "17:9",
            sensor: "16:9"
          },
          "HD": {
            recorded: "16:9",
            sensor: "16:9"
          }
        }
      },
      "Pocket Cinema Camera 6K G2": {
        formats: ["6K", "4K DCI", "4K UHD", "2K", "HD"],
        codecs: ["Blackmagic RAW", "ProRes 422 HQ", "ProRes 422"],
        sensorSizes: {
          "6K": "23.10 x 12.99 mm",
          "4K DCI": "23.10 x 12.99 mm",
          "4K UHD": "23.10 x 12.99 mm",
          "2K": "23.10 x 12.99 mm",
          "HD": "23.10 x 12.99 mm"
        },
        pixelResolutions: {
          "6K": "6144 x 3456",
          "4K DCI": "4096 x 2160",
          "4K UHD": "3840 x 2160",
          "2K": "2048 x 1080",
          "HD": "1920 x 1080"
        },
        aspectRatios: {
          "6K": {
            recorded: "16:9",
            sensor: "16:9"
          },
          "4K DCI": {
            recorded: "17:9",
            sensor: "16:9"
          },
          "4K UHD": {
            recorded: "16:9",
            sensor: "16:9"
          },
          "2K": {
            recorded: "17:9",
            sensor: "16:9"
          },
          "HD": {
            recorded: "16:9",
            sensor: "16:9"
          }
        }
      },
      "Pocket Cinema Camera 4K": {
        formats: ["4K DCI", "4K UHD", "2K", "HD"],
        codecs: ["Blackmagic RAW", "ProRes 422 HQ", "ProRes 422"],
        sensorSizes: {
          "4K DCI": "18.96 x 10.00 mm",
          "4K UHD": "18.96 x 10.00 mm",
          "2K": "18.96 x 10.00 mm",
          "HD": "18.96 x 10.00 mm"
        },
        pixelResolutions: {
          "4K DCI": "4096 x 2160",
          "4K UHD": "3840 x 2160",
          "2K": "2048 x 1080",
          "HD": "1920 x 1080"
        },
        aspectRatios: {
          "4K": {
            recorded: "16:9",
            sensor: "17:9"
          },
          "2K": {
            recorded: "16:9",
            sensor: "17:9"
          },
          "HD": {
            recorded: "16:9",
            sensor: "17:9"
          }
        }
      },
      "Studio Camera 4K Plus": {
        formats: ["4K UHD", "HD"],
        codecs: ["ProRes 422 HQ", "ProRes 422", "H.264"],
        sensorSizes: {
          "4K UHD": "25.34 x 14.25 mm",
          "HD": "25.34 x 14.25 mm"
        },
        pixelResolutions: {
          "4K UHD": "3840 x 2160",
          "HD": "1920 x 1080"
        },
        aspectRatios: {
          "4K UHD": {
            recorded: "16:9",
            sensor: "16:9"
          },
          "HD": {
            recorded: "16:9",
            sensor: "16:9"
          }
        }
      }
    }
  },
  "Sony": {
    models: {
      "FX9": {
        formats: ["6K", "4K", "2K", "HD"],
        codecs: ["XAVC-I", "XAVC-L", "ProRes 422 HQ", "ProRes 422"],
        sensorSizes: {
          "6K": "35.70 x 18.80 mm",
          "4K": "35.70 x 18.80 mm",
          "2K": "35.70 x 18.80 mm",
          "HD": "35.70 x 18.80 mm"
        },
        pixelResolutions: {
          "6K": "6048 x 3186",
          "4K": "4096 x 2160",
          "2K": "2048 x 1080",
          "HD": "1920 x 1080"
        },
        aspectRatios: {
          "6K": {
            recorded: "17:9",
            sensor: "17:9"
          },
          "4K": {
            recorded: "17:9",
            sensor: "17:9"
          },
          "2K": {
            recorded: "17:9",
            sensor: "17:9"
          },
          "HD": {
            recorded: "16:9",
            sensor: "17:9"
          }
        }
      },
      "FX30": {
        formats: ["4K", "HD"],
        codecs: ["XAVC S-I", "XAVC S", "XAVC HS"],
        sensorSizes: {
          "4K": "23.00 x 15.50 mm",
          "HD": "23.00 x 15.50 mm"
        },
        pixelResolutions: {
          "4K": "3840 x 2160",
          "HD": "1920 x 1080"
        },
        aspectRatios: {
          "4K": {
            recorded: "16:9",
            sensor: "3:2"
          },
          "HD": {
            recorded: "16:9",
            sensor: "3:2"
          }
        }
      },
      "FX6": {
        formats: ["4K", "2K", "HD"],
        codecs: ["XAVC-I", "XAVC-L", "ProRes 422 HQ", "ProRes 422"],
        sensorSizes: {
          "4K": "35.70 x 18.80 mm",
          "2K": "35.70 x 18.80 mm",
          "HD": "35.70 x 18.80 mm"
        },
        pixelResolutions: {
          "4K": "4096 x 2160",
          "2K": "2048 x 1080",
          "HD": "1920 x 1080"
        },
        aspectRatios: {
          "4K": {
            recorded: "17:9",
            sensor: "17:9"
          },
          "2K": {
            recorded: "17:9",
            sensor: "17:9"
          },
          "HD": {
            recorded: "16:9",
            sensor: "17:9"
          }
        }
      },
      "FX3": {
        formats: ["4K", "HD"],
        codecs: ["XAVC S-I", "XAVC S", "XAVC HS"],
        sensorSizes: {
          "4K": "35.60 x 23.80 mm",
          "HD": "35.60 x 23.80 mm"
        },
        pixelResolutions: {
          "4K": "3840 x 2160",
          "HD": "1920 x 1080"
        },
        aspectRatios: {
          "4K": {
            recorded: "16:9",
            sensor: "3:2"
          },
          "HD": {
            recorded: "16:9",
            sensor: "3:2"
          }
        }
      },
      "A7S III": {
        formats: ["4K", "HD"],
        codecs: ["XAVC S-I", "XAVC S", "XAVC HS"],
        sensorSizes: {
          "4K": "35.60 x 23.80 mm",
          "HD": "35.60 x 23.80 mm"
        },
        pixelResolutions: {
          "4K": "3840 x 2160",
          "HD": "1920 x 1080"
        },
        aspectRatios: {
          "4K": {
            recorded: "16:9",
            sensor: "3:2"
          },
          "HD": {
            recorded: "16:9",
            sensor: "3:2"
          }
        }
      },
      "VENICE 2": {
        formats: ["8.6K", "6K", "4K", "2K"],
        codecs: ["X-OCN", "XAVC-I", "ProRes 4444", "ProRes 422 HQ"],
        sensorSizes: {
          "8.6K": "36.20 x 24.10 mm",
          "6K": "36.20 x 24.10 mm",
          "4K": "36.20 x 24.10 mm",
          "2K": "36.20 x 24.10 mm"
        },
        pixelResolutions: {
          "8.6K": "8640 x 5760",
          "6K": "6048 x 4032",
          "4K": "4096 x 2160",
          "2K": "2048 x 1080"
        },
        aspectRatios: {
          "8.6K": {
            recorded: "3:2",
            sensor: "3:2"
          },
          "6K": {
            recorded: "3:2",
            sensor: "3:2"
          },
          "4K": {
            recorded: "17:9",
            sensor: "3:2"
          },
          "2K": {
            recorded: "17:9",
            sensor: "3:2"
          }
        }
      },
      "BURANO": {
        formats: ["8.6K", "4K", "2K"],
        codecs: ["X-OCN", "XAVC-I", "ProRes 4444", "ProRes 422 HQ"],
        sensorSizes: {
          "8.6K": "36.20 x 24.10 mm",
          "4K": "36.20 x 24.10 mm",
          "2K": "36.20 x 24.10 mm"
        },
        pixelResolutions: {
          "8.6K": "8640 x 5760",
          "4K": "4096 x 2160",
          "2K": "2048 x 1080"
        },
        aspectRatios: {
          "8.6K": {
            recorded: "3:2",
            sensor: "3:2"
          },
          "4K": {
            recorded: "17:9",
            sensor: "3:2"
          },
          "2K": {
            recorded: "17:9",
            sensor: "3:2"
          }
        }
      }
      ,
      "A1": {
        formats: ["8K", "4K UHD", "HD"],
        codecs: ["XAVC HS", "XAVC S-I", "XAVC S", "H.265", "H.264"],
        sensorSizes: {
          "8K": "35.60 x 23.80 mm",
          "4K UHD": "35.60 x 23.80 mm",
          "HD": "35.60 x 23.80 mm"
        },
        pixelResolutions: {
          "8K": "7680 x 4320",
          "4K UHD": "3840 x 2160",
          "HD": "1920 x 1080"
        },
        aspectRatios: {
          "8K": {
            recorded: "16:9",
            sensor: "3:2"
          },
          "4K UHD": {
            recorded: "16:9",
            sensor: "3:2"
          },
          "HD": {
            recorded: "16:9",
            sensor: "3:2"
          }
        }
      },
      "A7 IV": {
        formats: ["4K UHD", "HD"],
        codecs: ["XAVC S-I", "XAVC S", "XAVC HS"],
        sensorSizes: {
          "4K UHD": "35.60 x 23.80 mm",
          "HD": "35.60 x 23.80 mm"
        },
        pixelResolutions: {
          "4K UHD": "3840 x 2160",
          "HD": "1920 x 1080"
        },
        aspectRatios: {
          "4K UHD": {
            recorded: "16:9",
            sensor: "3:2"
          },
          "HD": {
            recorded: "16:9",
            sensor: "3:2"
          }
        }
      },
      "A7R V": {
        formats: ["4K UHD", "HD"],
        codecs: ["XAVC S-I", "XAVC S", "XAVC HS"],
        sensorSizes: {
          "4K UHD": "35.60 x 23.80 mm",
          "HD": "35.60 x 23.80 mm"
        },
        pixelResolutions: {
          "4K UHD": "3840 x 2160",
          "HD": "1920 x 1080"
        },
        aspectRatios: {
          "4K UHD": {
            recorded: "16:9",
            sensor: "3:2"
          },
          "HD": {
            recorded: "16:9",
            sensor: "3:2"
          }
        }
      },
      "A9 III": {
        formats: ["4K UHD", "HD"],
        codecs: ["XAVC S-I", "XAVC S", "XAVC HS"],
        sensorSizes: {
          "4K UHD": "35.60 x 23.80 mm",
          "HD": "35.60 x 23.80 mm"
        },
        pixelResolutions: {
          "4K UHD": "3840 x 2160",
          "HD": "1920 x 1080"
        },
        aspectRatios: {
          "4K UHD": {
            recorded: "16:9",
            sensor: "3:2"
          },
          "HD": {
            recorded: "16:9",
            sensor: "3:2"
          }
        }
      },
      "A7 III": {
        formats: ["4K UHD", "HD"],
        codecs: ["XAVC S"],
        sensorSizes: {
          "4K UHD": "35.60 x 23.80 mm",
          "HD": "35.60 x 23.80 mm"
        },
        pixelResolutions: {
          "4K UHD": "3840 x 2160",
          "HD": "1920 x 1080"
        },
        aspectRatios: {
          "4K UHD": { recorded: "16:9", sensor: "3:2" },
          "HD": { recorded: "16:9", sensor: "3:2" }
        }
      },
      "A7C": {
        formats: ["4K UHD", "HD"],
        codecs: ["XAVC S"],
        sensorSizes: {
          "4K UHD": "35.60 x 23.80 mm",
          "HD": "35.60 x 23.80 mm"
        },
        pixelResolutions: {
          "4K UHD": "3840 x 2160",
          "HD": "1920 x 1080"
        },
        aspectRatios: {
          "4K UHD": { recorded: "16:9", sensor: "3:2" },
          "HD": { recorded: "16:9", sensor: "3:2" }
        }
      },
      "A7C II": {
        formats: ["4K UHD", "HD"],
        codecs: ["XAVC S-I", "XAVC HS", "XAVC S"],
        sensorSizes: {
          "4K UHD": "35.60 x 23.80 mm",
          "HD": "35.60 x 23.80 mm"
        },
        pixelResolutions: {
          "4K UHD": "3840 x 2160",
          "HD": "1920 x 1080"
        },
        aspectRatios: {
          "4K UHD": { recorded: "16:9", sensor: "3:2" },
          "HD": { recorded: "16:9", sensor: "3:2" }
        }
      },
      "A6700": {
        formats: ["4K UHD", "HD"],
        codecs: ["XAVC HS", "XAVC S"],
        sensorSizes: {
          "4K UHD": "23.50 x 15.60 mm",
          "HD": "23.50 x 15.60 mm"
        },
        pixelResolutions: {
          "4K UHD": "3840 x 2160",
          "HD": "1920 x 1080"
        },
        aspectRatios: {
          "4K UHD": { recorded: "16:9", sensor: "3:2" },
          "HD": { recorded: "16:9", sensor: "3:2" }
        }
      },
      "ZV-E1": {
        formats: ["4K UHD", "HD"],
        codecs: ["XAVC S-I", "XAVC HS", "XAVC S"],
        sensorSizes: {
          "4K UHD": "35.60 x 23.80 mm",
          "HD": "35.60 x 23.80 mm"
        },
        pixelResolutions: {
          "4K UHD": "3840 x 2160",
          "HD": "1920 x 1080"
        },
        aspectRatios: {
          "4K UHD": { recorded: "16:9", sensor: "3:2" },
          "HD": { recorded: "16:9", sensor: "3:2" }
        }
      },
      "ZV-E10": {
        formats: ["4K UHD", "HD"],
        codecs: ["XAVC S"],
        sensorSizes: {
          "4K UHD": "23.50 x 15.60 mm",
          "HD": "23.50 x 15.60 mm"
        },
        pixelResolutions: {
          "4K UHD": "3840 x 2160",
          "HD": "1920 x 1080"
        },
        aspectRatios: {
          "4K UHD": { recorded: "16:9", sensor: "3:2" },
          "HD": { recorded: "16:9", sensor: "3:2" }
        }
      },
      "VENICE": {
        formats: ["6K FF", "4K", "2K", "HD"],
        codecs: ["X-OCN", "XAVC-I", "ProRes 422 HQ", "ProRes 422"],
        sensorSizes: {
          "6K FF": "36.00 x 24.00 mm",
          "4K": "36.00 x 24.00 mm",
          "2K": "36.00 x 24.00 mm",
          "HD": "36.00 x 24.00 mm"
        },
        pixelResolutions: {
          "6K FF": "6048 x 4032",
          "4K": "4096 x 2160",
          "2K": "2048 x 1080",
          "HD": "1920 x 1080"
        },
        aspectRatios: {
          "6K FF": {
            recorded: "3:2",
            sensor: "3:2"
          },
          "4K": {
            recorded: "17:9",
            sensor: "3:2"
          },
          "2K": {
            recorded: "17:9",
            sensor: "3:2"
          },
          "HD": {
            recorded: "16:9",
            sensor: "3:2"
          }
        }
      },
      "FS7": {
        formats: ["4K DCI", "4K UHD", "2K", "HD"],
        codecs: ["XAVC-I", "XAVC-L", "ProRes 422 HQ", "ProRes 422"],
        sensorSizes: {
          "4K DCI": "26.20 x 13.80 mm",
          "4K UHD": "26.20 x 13.80 mm",
          "2K": "26.20 x 13.80 mm",
          "HD": "26.20 x 13.80 mm"
        },
        pixelResolutions: {
          "4K DCI": "4096 x 2160",
          "4K UHD": "3840 x 2160",
          "2K": "2048 x 1080",
          "HD": "1920 x 1080"
        },
        aspectRatios: {
          "4K DCI": {
            recorded: "17:9",
            sensor: "17:9"
          },
          "4K UHD": {
            recorded: "16:9",
            sensor: "17:9"
          },
          "2K": {
            recorded: "17:9",
            sensor: "17:9"
          },
          "HD": {
            recorded: "16:9",
            sensor: "17:9"
          }
        }
      },
      "FS5": {
        formats: ["4K UHD", "HD"],
        codecs: ["XAVC-L", "AVCHD"],
        sensorSizes: {
          "4K UHD": "26.20 x 13.80 mm",
          "HD": "26.20 x 13.80 mm"
        },
        pixelResolutions: {
          "4K UHD": "3840 x 2160",
          "HD": "1920 x 1080"
        },
        aspectRatios: {
          "4K UHD": {
            recorded: "16:9",
            sensor: "17:9"
          },
          "HD": {
            recorded: "16:9",
            sensor: "17:9"
          }
        }
      },
      "F55": {
        formats: ["4K", "2K", "HD"],
        codecs: ["XAVC-I", "RAW", "ProRes 422 HQ", "ProRes 422"],
        sensorSizes: {
          "4K": "24.00 x 13.00 mm",
          "2K": "24.00 x 13.00 mm",
          "HD": "24.00 x 13.00 mm"
        },
        pixelResolutions: {
          "4K": "4096 x 2160",
          "2K": "2048 x 1080",
          "HD": "1920 x 1080"
        },
        aspectRatios: {
          "4K": {
            recorded: "17:9",
            sensor: "17:9"
          },
          "2K": {
            recorded: "17:9",
            sensor: "17:9"
          },
          "HD": {
            recorded: "16:9",
            sensor: "17:9"
          }
        }
      },
      "F65": {
        formats: ["8K", "4K", "2K", "HD"],
        codecs: ["RAW", "XAVC-I", "ProRes 422 HQ", "ProRes 422"],
        sensorSizes: {
          "8K": "24.70 x 13.10 mm",
          "4K": "24.70 x 13.10 mm",
          "2K": "24.70 x 13.10 mm",
          "HD": "24.70 x 13.10 mm"
        },
        pixelResolutions: {
          "8K": "8192 x 4320",
          "4K": "4096 x 2160",
          "2K": "2048 x 1080",
          "HD": "1920 x 1080"
        },
        aspectRatios: {
          "8K": {
            recorded: "17:9",
            sensor: "17:9"
          },
          "4K": {
            recorded: "17:9",
            sensor: "17:9"
          },
          "2K": {
            recorded: "17:9",
            sensor: "17:9"
          },
          "HD": {
            recorded: "16:9",
            sensor: "17:9"
          }
        }
      }
    }
  },
  "Canon": {
    models: {
      "EOS C70": {
        formats: ["4K DCI", "4K UHD", "2K", "HD"],
        codecs: ["Cinema RAW Light", "XF-AVC", "MP4"],
        sensorSizes: {
          "4K DCI": "22.20 x 11.70 mm",
          "4K UHD": "22.20 x 11.70 mm",
          "2K": "22.20 x 11.70 mm",
          "HD": "22.20 x 11.70 mm"
        },
        pixelResolutions: {
          "4K DCI": "4096 x 2160",
          "4K UHD": "3840 x 2160",
          "2K": "2048 x 1080",
          "HD": "1920 x 1080"
        },
        aspectRatios: {
          "4K": {
            recorded: "17:9",
            sensor: "17:9"
          },
          "2K": {
            recorded: "17:9",
            sensor: "17:9"
          },
          "HD": {
            recorded: "16:9",
            sensor: "17:9"
          }
        }
      },
      "EOS C300 Mark III": {
        formats: ["4K DCI", "4K UHD", "2K", "HD"],
        codecs: ["Cinema RAW Light", "XF-AVC", "ProRes 422 HQ", "ProRes 422"],
        sensorSizes: {
          "4K DCI": "26.20 x 13.80 mm",
          "4K UHD": "26.20 x 13.80 mm",
          "2K": "26.20 x 13.80 mm",
          "HD": "26.20 x 13.80 mm"
        },
        pixelResolutions: {
          "4K DCI": "4096 x 2160",
          "4K UHD": "3840 x 2160",
          "2K": "2048 x 1080",
          "HD": "1920 x 1080"
        },
        aspectRatios: {
          "4K DCI": {
            recorded: "17:9",
            sensor: "17:9"
          },
          "4K UHD": {
            recorded: "16:9",
            sensor: "17:9"
          },
          "2K": {
            recorded: "17:9",
            sensor: "17:9"
          },
          "HD": {
            recorded: "16:9",
            sensor: "17:9"
          }
        }
      },
      "EOS C500 Mark II": {
        formats: ["5.9K", "4K DCI", "4K UHD", "2K", "HD"],
        codecs: ["Cinema RAW Light", "XF-AVC", "ProRes 422 HQ", "ProRes 422"],
        sensorSizes: {
          "5.9K": "36.00 x 19.00 mm",
          "4K DCI": "36.00 x 19.00 mm",
          "4K UHD": "36.00 x 19.00 mm",
          "2K": "36.00 x 19.00 mm",
          "HD": "36.00 x 19.00 mm"
        },
        pixelResolutions: {
          "5.9K": "5952 x 3140",
          "4K DCI": "4096 x 2160",
          "4K UHD": "3840 x 2160",
          "2K": "2048 x 1080",
          "HD": "1920 x 1080"
        },
        aspectRatios: {
          "5.9K": {
            recorded: "17:9",
            sensor: "17:9"
          },
          "4K": {
            recorded: "17:9",
            sensor: "17:9"
          },
          "2K": {
            recorded: "17:9",
            sensor: "17:9"
          },
          "HD": {
            recorded: "16:9",
            sensor: "17:9"
          }
        }
      },
      "EOS R5 C": {
        formats: ["8K", "4K DCI", "4K UHD", "2K", "HD"],
        codecs: ["Cinema RAW Light", "XF-AVC", "MP4"],
        sensorSizes: {
          "8K": "36.00 x 24.00 mm",
          "4K DCI": "36.00 x 24.00 mm",
          "4K UHD": "36.00 x 24.00 mm",
          "2K": "36.00 x 24.00 mm",
          "HD": "36.00 x 24.00 mm"
        },
        pixelResolutions: {
          "8K": "8192 x 4320",
          "4K DCI": "4096 x 2160",
          "4K UHD": "3840 x 2160",
          "2K": "2048 x 1080",
          "HD": "1920 x 1080"
        },
        aspectRatios: {
          "8K": {
            recorded: "17:9",
            sensor: "3:2"
          },
          "4K": {
            recorded: "16:9",
            sensor: "3:2"
          },
          "HD": {
            recorded: "16:9",
            sensor: "3:2"
          }
        }
      },
      "EOS R6 Mark II": {
        formats: ["4K UHD", "HD"],
        codecs: ["Canon Log 3", "MP4", "MOV"],
        sensorSizes: {
          "4K UHD": "36.00 x 24.00 mm",
          "HD": "36.00 x 24.00 mm"
        },
        pixelResolutions: {
          "4K UHD": "3840 x 2160",
          "HD": "1920 x 1080"
        },
        aspectRatios: {
          "4K": {
            recorded: "16:9",
            sensor: "3:2"
          },
          "HD": {
            recorded: "16:9",
            sensor: "3:2"
          }
        }
      },
      "EOS R6": {
        formats: ["4K UHD", "HD"],
        codecs: ["H.265", "H.264", "MP4", "MOV"],
        sensorSizes: {
          "4K UHD": "36.00 x 24.00 mm",
          "HD": "36.00 x 24.00 mm"
        },
        pixelResolutions: {
          "4K UHD": "3840 x 2160",
          "HD": "1920 x 1080"
        },
        aspectRatios: {
          "4K": {
            recorded: "16:9",
            sensor: "3:2"
          },
          "HD": {
            recorded: "16:9",
            sensor: "3:2"
          }
        }
      },
      "EOS 6D": {
        formats: ["HD"],
        codecs: ["H.264", "MOV"],
        sensorSizes: {
          "HD": "36.00 x 24.00 mm"
        },
        pixelResolutions: {
          "HD": "1920 x 1080"
        },
        aspectRatios: {
          "HD": {
            recorded: "16:9",
            sensor: "3:2"
          }
        }
      },
      "EOS C300 Mark II": {
        formats: ["4K DCI", "4K UHD", "2K", "HD"],
        codecs: ["XF-AVC", "ProRes 422 HQ", "ProRes 422"],
        sensorSizes: {
          "4K DCI": "26.20 x 13.80 mm",
          "4K UHD": "26.20 x 13.80 mm",
          "2K": "26.20 x 13.80 mm",
          "HD": "26.20 x 13.80 mm"
        },
        pixelResolutions: {
          "4K DCI": "4096 x 2160",
          "4K UHD": "3840 x 2160",
          "2K": "2048 x 1080",
          "HD": "1920 x 1080"
        },
        aspectRatios: {
          "4K DCI": {
            recorded: "17:9",
            sensor: "17:9"
          },
          "4K UHD": {
            recorded: "16:9",
            sensor: "17:9"
          },
          "2K": {
            recorded: "17:9",
            sensor: "17:9"
          },
          "HD": {
            recorded: "16:9",
            sensor: "17:9"
          }
        }
      },
      "EOS C200": {
        formats: ["4K DCI", "4K UHD", "2K", "HD"],
        codecs: ["Cinema RAW Light", "MP4"],
        sensorSizes: {
          "4K DCI": "26.20 x 13.80 mm",
          "4K UHD": "26.20 x 13.80 mm",
          "2K": "26.20 x 13.80 mm",
          "HD": "26.20 x 13.80 mm"
        },
        pixelResolutions: {
          "4K DCI": "4096 x 2160",
          "4K UHD": "3840 x 2160",
          "2K": "2048 x 1080",
          "HD": "1920 x 1080"
        },
        aspectRatios: {
          "4K DCI": {
            recorded: "17:9",
            sensor: "17:9"
          },
          "4K UHD": {
            recorded: "16:9",
            sensor: "17:9"
          },
          "2K": {
            recorded: "17:9",
            sensor: "17:9"
          },
          "HD": {
            recorded: "16:9",
            sensor: "17:9"
          }
        }
      },
      "EOS C100 Mark II": {
        formats: ["HD"],
        codecs: ["AVCHD", "MP4"],
        sensorSizes: {
          "HD": "26.20 x 13.80 mm"
        },
        pixelResolutions: {
          "HD": "1920 x 1080"
        },
        aspectRatios: {
          "HD": {
            recorded: "16:9",
            sensor: "17:9"
          }
        }
      },
      "EOS C500": {
        formats: ["4K DCI", "2K", "HD"],
        codecs: ["Canon RAW", "MPEG-2"],
        sensorSizes: {
          "4K DCI": "26.20 x 13.80 mm",
          "2K": "26.20 x 13.80 mm",
          "HD": "26.20 x 13.80 mm"
        },
        pixelResolutions: {
          "4K DCI": "4096 x 2160",
          "2K": "2048 x 1080",
          "HD": "1920 x 1080"
        },
        aspectRatios: {
          "4K DCI": {
            recorded: "17:9",
            sensor: "17:9"
          },
          "2K": {
            recorded: "17:9",
            sensor: "17:9"
          },
          "HD": {
            recorded: "16:9",
            sensor: "17:9"
          }
        }
      }
      ,
      "EOS R5": {
        formats: ["8K", "4K DCI", "4K UHD", "HD"],
        codecs: ["Cinema RAW Light", "XF-AVC", "MP4"],
        sensorSizes: {
          "8K": "36.00 x 24.00 mm",
          "4K DCI": "36.00 x 24.00 mm",
          "4K UHD": "36.00 x 24.00 mm",
          "HD": "36.00 x 24.00 mm"
        },
        pixelResolutions: {
          "8K": "8192 x 4320",
          "4K DCI": "4096 x 2160",
          "4K UHD": "3840 x 2160",
          "HD": "1920 x 1080"
        },
        aspectRatios: {
          "8K": {
            recorded: "17:9",
            sensor: "3:2"
          },
          "4K DCI": {
            recorded: "17:9",
            sensor: "3:2"
          },
          "4K UHD": {
            recorded: "16:9",
            sensor: "3:2"
          },
          "HD": {
            recorded: "16:9",
            sensor: "3:2"
          }
        }
      },
      "EOS R7": {
        formats: ["4K DCI", "4K UHD", "HD"],
        codecs: ["MP4", "MOV"],
        sensorSizes: {
          "4K DCI": "22.30 x 14.90 mm",
          "4K UHD": "22.30 x 14.90 mm",
          "HD": "22.30 x 14.90 mm"
        },
        pixelResolutions: {
          "4K DCI": "4096 x 2160",
          "4K UHD": "3840 x 2160",
          "HD": "1920 x 1080"
        },
        aspectRatios: {
          "4K DCI": {
            recorded: "17:9",
            sensor: "3:2"
          },
          "4K UHD": {
            recorded: "16:9",
            sensor: "3:2"
          },
          "HD": {
            recorded: "16:9",
            sensor: "3:2"
          }
        }
      },
      "EOS R3": {
        formats: ["6K", "4K DCI", "4K UHD", "HD"],
        codecs: ["Cinema RAW Light", "XF-AVC", "MP4"],
        sensorSizes: {
          "6K": "36.00 x 24.00 mm",
          "4K DCI": "36.00 x 24.00 mm",
          "4K UHD": "36.00 x 24.00 mm",
          "HD": "36.00 x 24.00 mm"
        },
        pixelResolutions: {
          "6K": "6000 x 3164",
          "4K DCI": "4096 x 2160",
          "4K UHD": "3840 x 2160",
          "HD": "1920 x 1080"
        },
        aspectRatios: {
          "6K": {
            recorded: "17:9",
            sensor: "3:2"
          },
          "4K DCI": {
            recorded: "17:9",
            sensor: "3:2"
          },
          "4K UHD": {
            recorded: "16:9",
            sensor: "3:2"
          },
          "HD": {
            recorded: "16:9",
            sensor: "3:2"
          }
        }
      },
      "EOS 5D Mark IV": {
        formats: ["4K DCI", "HD"],
        codecs: ["MJPEG", "H.264"],
        sensorSizes: {
          "4K DCI": "36.00 x 24.00 mm",
          "HD": "36.00 x 24.00 mm"
        },
        pixelResolutions: {
          "4K DCI": "4096 x 2160",
          "HD": "1920 x 1080"
        },
        aspectRatios: {
          "4K DCI": {
            recorded: "17:9",
            sensor: "3:2"
          },
          "HD": {
            recorded: "16:9",
            sensor: "3:2"
          }
        }
      },
      "EOS-1D X Mark III": {
        formats: ["5.5K", "4K DCI", "HD"],
        codecs: ["Cinema RAW Light", "H.265", "H.264"],
        sensorSizes: {
          "5.5K": "36.00 x 24.00 mm",
          "4K DCI": "36.00 x 24.00 mm",
          "HD": "36.00 x 24.00 mm"
        },
        pixelResolutions: {
          "5.5K": "5472 x 2886",
          "4K DCI": "4096 x 2160",
          "HD": "1920 x 1080"
        },
        aspectRatios: {
          "5.5K": {
            recorded: "17:9",
            sensor: "3:2"
          },
          "4K DCI": {
            recorded: "17:9",
            sensor: "3:2"
          },
          "HD": {
            recorded: "16:9",
            sensor: "3:2"
          }
        }
      },
      "EOS C700 FF": {
        formats: ["5.9K", "4K DCI", "4K UHD", "2K", "HD"],
        codecs: ["Cinema RAW Light", "XF-AVC", "ProRes 422 HQ", "ProRes 422"],
        sensorSizes: {
          "5.9K": "36.00 x 19.00 mm",
          "4K DCI": "36.00 x 19.00 mm",
          "4K UHD": "36.00 x 19.00 mm",
          "2K": "36.00 x 19.00 mm",
          "HD": "36.00 x 19.00 mm"
        },
        pixelResolutions: {
          "5.9K": "5952 x 3140",
          "4K DCI": "4096 x 2160",
          "4K UHD": "3840 x 2160",
          "2K": "2048 x 1080",
          "HD": "1920 x 1080"
        },
        aspectRatios: {
          "5.9K": {
            recorded: "17:9",
            sensor: "17:9"
          },
          "4K DCI": {
            recorded: "17:9",
            sensor: "17:9"
          },
          "4K UHD": {
            recorded: "16:9",
            sensor: "17:9"
          },
          "2K": {
            recorded: "17:9",
            sensor: "17:9"
          },
          "HD": {
            recorded: "16:9",
            sensor: "17:9"
          }
        }
      }
    }
  },
  "Panasonic": {
    models: {
      "Lumix S1H": {
        formats: ["6K", "4K DCI", "4K UHD", "HD"],
        codecs: ["ProRes 422 HQ", "ProRes 422", "MOV", "MP4"],
        sensorSizes: {
          "6K": "36.00 x 24.00 mm",
          "4K DCI": "36.00 x 24.00 mm",
          "4K UHD": "36.00 x 24.00 mm",
          "HD": "36.00 x 24.00 mm"
        },
        pixelResolutions: {
          "6K": "5952 x 3968",
          "4K DCI": "4096 x 2160",
          "4K UHD": "3840 x 2160",
          "HD": "1920 x 1080"
        },
        aspectRatios: {
          "6K": {
            recorded: "3:2",
            sensor: "3:2"
          },
          "4K DCI": {
            recorded: "17:9",
            sensor: "3:2"
          },
          "4K UHD": {
            recorded: "16:9",
            sensor: "3:2"
          },
          "HD": {
            recorded: "16:9",
            sensor: "3:2"
          }
        }
      },
      "Lumix S5": {
        formats: ["4K DCI", "4K UHD", "HD"],
        codecs: ["ProRes 422 HQ", "ProRes 422", "MOV", "MP4"],
        sensorSizes: {
          "4K DCI": "36.00 x 24.00 mm",
          "4K UHD": "36.00 x 24.00 mm",
          "HD": "36.00 x 24.00 mm"
        },
        pixelResolutions: {
          "4K DCI": "4096 x 2160",
          "4K UHD": "3840 x 2160",
          "HD": "1920 x 1080"
        },
        aspectRatios: {
          "4K DCI": {
            recorded: "17:9",
            sensor: "3:2"
          },
          "4K UHD": {
            recorded: "16:9",
            sensor: "3:2"
          },
          "HD": {
            recorded: "16:9",
            sensor: "3:2"
          }
        }
      },
      "Lumix S1": {
        formats: ["4K DCI", "4K UHD", "HD"],
        codecs: ["ProRes 422 HQ", "ProRes 422", "MOV", "MP4"],
        sensorSizes: {
          "4K DCI": "36.00 x 24.00 mm",
          "4K UHD": "36.00 x 24.00 mm",
          "HD": "36.00 x 24.00 mm"
        },
        pixelResolutions: {
          "4K DCI": "4096 x 2160",
          "4K UHD": "3840 x 2160",
          "HD": "1920 x 1080"
        },
        aspectRatios: {
          "4K DCI": {
            recorded: "17:9",
            sensor: "3:2"
          },
          "4K UHD": {
            recorded: "16:9",
            sensor: "3:2"
          },
          "HD": {
            recorded: "16:9",
            sensor: "3:2"
          }
        }
      },
      "Lumix S5 II": {
        formats: ["6K", "4K DCI", "4K UHD", "HD"],
        codecs: ["ProRes 422 HQ", "ProRes 422", "MOV", "MP4"],
        sensorSizes: {
          "6K": "36.00 x 24.00 mm",
          "4K DCI": "36.00 x 24.00 mm",
          "4K UHD": "36.00 x 24.00 mm",
          "HD": "36.00 x 24.00 mm"
        },
        pixelResolutions: {
          "6K": "6000 x 4000",
          "4K DCI": "4096 x 2160",
          "4K UHD": "3840 x 2160",
          "HD": "1920 x 1080"
        },
        aspectRatios: {
          "6K": {
            recorded: "3:2",
            sensor: "3:2"
          },
          "4K DCI": {
            recorded: "17:9",
            sensor: "3:2"
          },
          "4K UHD": {
            recorded: "16:9",
            sensor: "3:2"
          },
          "HD": {
            recorded: "16:9",
            sensor: "3:2"
          }
        }
      },
      "Lumix S5 II X": {
        formats: ["6K", "4K DCI", "4K UHD", "HD"],
        codecs: ["ProRes 422 HQ", "ProRes 422", "MOV", "MP4"],
        sensorSizes: {
          "6K": "36.00 x 24.00 mm",
          "4K DCI": "36.00 x 24.00 mm",
          "4K UHD": "36.00 x 24.00 mm",
          "HD": "36.00 x 24.00 mm"
        },
        pixelResolutions: {
          "6K": "6000 x 4000",
          "4K DCI": "4096 x 2160",
          "4K UHD": "3840 x 2160",
          "HD": "1920 x 1080"
        },
        aspectRatios: {
          "6K": {
            recorded: "3:2",
            sensor: "3:2"
          },
          "4K DCI": {
            recorded: "17:9",
            sensor: "3:2"
          },
          "4K UHD": {
            recorded: "16:9",
            sensor: "3:2"
          },
          "HD": {
            recorded: "16:9",
            sensor: "3:2"
          }
        }
      },
      "Lumix GH5": {
        formats: ["4K DCI", "4K UHD", "HD"],
        codecs: ["ProRes 422 HQ", "ProRes 422", "MOV", "MP4"],
        sensorSizes: {
          "4K DCI": "17.30 x 13.00 mm",
          "4K UHD": "17.30 x 13.00 mm",
          "HD": "17.30 x 13.00 mm"
        },
        pixelResolutions: {
          "4K DCI": "4096 x 2160",
          "4K UHD": "3840 x 2160",
          "HD": "1920 x 1080"
        },
        aspectRatios: {
          "4K DCI": {
            recorded: "17:9",
            sensor: "4:3"
          },
          "4K UHD": {
            recorded: "16:9",
            sensor: "4:3"
          },
          "HD": {
            recorded: "16:9",
            sensor: "4:3"
          }
        }
      },
      "Lumix GH5S": {
        formats: ["4K DCI", "4K UHD", "HD"],
        codecs: ["ProRes 422 HQ", "ProRes 422", "MOV", "MP4"],
        sensorSizes: {
          "4K DCI": "17.30 x 13.00 mm",
          "4K UHD": "17.30 x 13.00 mm",
          "HD": "17.30 x 13.00 mm"
        },
        pixelResolutions: {
          "4K DCI": "4096 x 2160",
          "4K UHD": "3840 x 2160",
          "HD": "1920 x 1080"
        },
        aspectRatios: {
          "4K DCI": {
            recorded: "17:9",
            sensor: "4:3"
          },
          "4K UHD": {
            recorded: "16:9",
            sensor: "4:3"
          },
          "HD": {
            recorded: "16:9",
            sensor: "4:3"
          }
        }
      },
      "Lumix GH6": {
        formats: ["5.7K", "4K DCI", "4K UHD", "HD"],
        codecs: ["ProRes 422 HQ", "ProRes 422", "MOV", "MP4"],
        sensorSizes: {
          "5.7K": "17.30 x 13.00 mm",
          "4K DCI": "17.30 x 13.00 mm",
          "4K UHD": "17.30 x 13.00 mm",
          "HD": "17.30 x 13.00 mm"
        },
        pixelResolutions: {
          "5.7K": "5728 x 4304",
          "4K DCI": "4096 x 2160",
          "4K UHD": "3840 x 2160",
          "HD": "1920 x 1080"
        },
        aspectRatios: {
          "5.7K": {
            recorded: "4:3",
            sensor: "4:3"
          },
          "4K DCI": {
            recorded: "17:9",
            sensor: "4:3"
          },
          "4K UHD": {
            recorded: "16:9",
            sensor: "4:3"
          },
          "HD": {
            recorded: "16:9",
            sensor: "4:3"
          }
        }
      },
      "Lumix GH4": {
        formats: ["4K DCI", "4K UHD", "HD"],
        codecs: ["ProRes 422 HQ", "ProRes 422", "MOV", "MP4"],
        sensorSizes: {
          "4K DCI": "17.30 x 13.00 mm",
          "4K UHD": "17.30 x 13.00 mm",
          "HD": "17.30 x 13.00 mm"
        },
        pixelResolutions: {
          "4K DCI": "4096 x 2160",
          "4K UHD": "3840 x 2160",
          "HD": "1920 x 1080"
        },
        aspectRatios: {
          "4K DCI": {
            recorded: "17:9",
            sensor: "4:3"
          },
          "4K UHD": {
            recorded: "16:9",
            sensor: "4:3"
          },
          "HD": {
            recorded: "16:9",
            sensor: "4:3"
          }
        }
      },
      "Lumix BGH1": {
        formats: ["4K DCI", "4K UHD", "HD"],
        codecs: ["ProRes 422 HQ", "ProRes 422", "MOV", "MP4"],
        sensorSizes: {
          "4K DCI": "17.30 x 13.00 mm",
          "4K UHD": "17.30 x 13.00 mm",
          "HD": "17.30 x 13.00 mm"
        },
        pixelResolutions: {
          "4K DCI": "4096 x 2160",
          "4K UHD": "3840 x 2160",
          "HD": "1920 x 1080"
        },
        aspectRatios: {
          "4K DCI": {
            recorded: "17:9",
            sensor: "4:3"
          },
          "4K UHD": {
            recorded: "16:9",
            sensor: "4:3"
          },
          "HD": {
            recorded: "16:9",
            sensor: "4:3"
          }
        }
      },
      "AU-EVA1": {
        formats: ["5.7K", "4K DCI", "4K UHD", "2K", "HD"],
        codecs: ["ProRes 422 HQ", "ProRes 422", "AVC-Intra"],
        sensorSizes: {
          "5.7K": "23.10 x 12.99 mm",
          "4K DCI": "23.10 x 12.99 mm",
          "4K UHD": "23.10 x 12.99 mm",
          "2K": "23.10 x 12.99 mm",
          "HD": "23.10 x 12.99 mm"
        },
        pixelResolutions: {
          "5.7K": "5728 x 3024",
          "4K DCI": "4096 x 2160",
          "4K UHD": "3840 x 2160",
          "2K": "2048 x 1080",
          "HD": "1920 x 1080"
        },
        aspectRatios: {
          "5.7K": {
            recorded: "17:9",
            sensor: "17:9"
          },
          "4K DCI": {
            recorded: "17:9",
            sensor: "17:9"
          },
          "4K UHD": {
            recorded: "16:9",
            sensor: "17:9"
          },
          "2K": {
            recorded: "17:9",
            sensor: "17:9"
          },
          "HD": {
            recorded: "16:9",
            sensor: "17:9"
          }
        }
      },
      "VariCam LT": {
        formats: ["4K DCI", "4K UHD", "2K", "HD"],
        codecs: ["ProRes 4444", "ProRes 422 HQ", "ProRes 422", "AVC-Intra"],
        sensorSizes: {
          "4K DCI": "23.10 x 12.99 mm",
          "4K UHD": "23.10 x 12.99 mm",
          "2K": "23.10 x 12.99 mm",
          "HD": "23.10 x 12.99 mm"
        },
        pixelResolutions: {
          "4K DCI": "4096 x 2160",
          "4K UHD": "3840 x 2160",
          "2K": "2048 x 1080",
          "HD": "1920 x 1080"
        },
        aspectRatios: {
          "4K DCI": {
            recorded: "17:9",
            sensor: "17:9"
          },
          "4K UHD": {
            recorded: "16:9",
            sensor: "17:9"
          },
          "2K": {
            recorded: "17:9",
            sensor: "17:9"
          },
          "HD": {
            recorded: "16:9",
            sensor: "17:9"
          }
        }
      }
    }
  },
  "Fujifilm": {
    models: {
      "X-H2S": {
        formats: ["6.2K", "4K DCI", "4K UHD", "HD"],
        codecs: ["F-Log2", "ProRes 422 HQ", "H.265", "H.264"],
        sensorSizes: {
          "6.2K": "23.50 x 15.70 mm",
          "4K DCI": "23.50 x 15.70 mm",
          "4K UHD": "23.50 x 15.70 mm",
          "HD": "23.50 x 15.70 mm"
        },
        pixelResolutions: {
          "6.2K": "6240 x 4160",
          "4K DCI": "4096 x 2160",
          "4K UHD": "3840 x 2160",
          "HD": "1920 x 1080"
        },
        aspectRatios: {
          "6.2K": {
            recorded: "3:2",
            sensor: "3:2"
          },
          "4K DCI": {
            recorded: "17:9",
            sensor: "3:2"
          },
          "4K UHD": {
            recorded: "16:9",
            sensor: "3:2"
          },
          "HD": {
            recorded: "16:9",
            sensor: "3:2"
          }
        }
      },
      "X-T3": {
        formats: ["4K DCI", "4K UHD", "HD"],
        codecs: ["F-Log", "H.265", "H.264"],
        sensorSizes: {
          "4K DCI": "23.50 x 15.60 mm",
          "4K UHD": "23.50 x 15.60 mm",
          "HD": "23.50 x 15.60 mm"
        },
        pixelResolutions: {
          "4K DCI": "4096 x 2160",
          "4K UHD": "3840 x 2160",
          "HD": "1920 x 1080"
        },
        aspectRatios: {
          "4K DCI": {
            recorded: "17:9",
            sensor: "3:2"
          },
          "4K UHD": {
            recorded: "16:9",
            sensor: "3:2"
          },
          "HD": {
            recorded: "16:9",
            sensor: "3:2"
          }
        }
      },
      "X-H2": {
        formats: ["8K", "4K DCI", "4K UHD", "HD"],
        codecs: ["F-Log2", "ProRes 422 HQ", "H.265", "H.264"],
        sensorSizes: {
          "8K": "23.50 x 15.70 mm",
          "4K DCI": "23.50 x 15.70 mm",
          "4K UHD": "23.50 x 15.70 mm",
          "HD": "23.50 x 15.70 mm"
        },
        pixelResolutions: {
          "8K": "7680 x 4320",
          "4K DCI": "4096 x 2160",
          "4K UHD": "3840 x 2160",
          "HD": "1920 x 1080"
        },
        aspectRatios: {
          "8K": {
            recorded: "16:9",
            sensor: "3:2"
          },
          "4K DCI": {
            recorded: "17:9",
            sensor: "3:2"
          },
          "4K UHD": {
            recorded: "16:9",
            sensor: "3:2"
          },
          "HD": {
            recorded: "16:9",
            sensor: "3:2"
          }
        }
      },
      "X-T5": {
        formats: ["6.2K", "4K DCI", "4K UHD", "HD"],
        codecs: ["F-Log2", "H.265", "H.264"],
        sensorSizes: {
          "6.2K": "23.50 x 15.70 mm",
          "4K DCI": "23.50 x 15.70 mm",
          "4K UHD": "23.50 x 15.70 mm",
          "HD": "23.50 x 15.70 mm"
        },
        pixelResolutions: {
          "6.2K": "6240 x 4160",
          "4K DCI": "4096 x 2160",
          "4K UHD": "3840 x 2160",
          "HD": "1920 x 1080"
        },
        aspectRatios: {
          "6.2K": {
            recorded: "3:2",
            sensor: "3:2"
          },
          "4K DCI": {
            recorded: "17:9",
            sensor: "3:2"
          },
          "4K UHD": {
            recorded: "16:9",
            sensor: "3:2"
          },
          "HD": {
            recorded: "16:9",
            sensor: "3:2"
          }
        }
      },
      "X-T4": {
        formats: ["4K DCI", "4K UHD", "HD"],
        codecs: ["F-Log", "H.265", "H.264"],
        sensorSizes: {
          "4K DCI": "23.50 x 15.60 mm",
          "4K UHD": "23.50 x 15.60 mm",
          "HD": "23.50 x 15.60 mm"
        },
        pixelResolutions: {
          "4K DCI": "4096 x 2160",
          "4K UHD": "3840 x 2160",
          "HD": "1920 x 1080"
        },
        aspectRatios: {
          "4K DCI": {
            recorded: "17:9",
            sensor: "3:2"
          },
          "4K UHD": {
            recorded: "16:9",
            sensor: "3:2"
          },
          "HD": {
            recorded: "16:9",
            sensor: "3:2"
          }
        }
      },
      "X-S20": {
        formats: ["6.2K", "4K DCI", "4K UHD", "HD"],
        codecs: ["F-Log2", "H.265", "H.264"],
        sensorSizes: {
          "6.2K": "23.50 x 15.70 mm",
          "4K DCI": "23.50 x 15.70 mm",
          "4K UHD": "23.50 x 15.70 mm",
          "HD": "23.50 x 15.70 mm"
        },
        pixelResolutions: {
          "6.2K": "6240 x 4160",
          "4K DCI": "4096 x 2160",
          "4K UHD": "3840 x 2160",
          "HD": "1920 x 1080"
        },
        aspectRatios: {
          "6.2K": {
            recorded: "3:2",
            sensor: "3:2"
          },
          "4K DCI": {
            recorded: "17:9",
            sensor: "3:2"
          },
          "4K UHD": {
            recorded: "16:9",
            sensor: "3:2"
          },
          "HD": {
            recorded: "16:9",
            sensor: "3:2"
          }
        }
      }
    }
  },
  "Nikon": {
    models: {
      "Z6": {
        formats: ["4K UHD", "HD"],
        codecs: ["ProRes 422 HQ", "ProRes 422", "H.265", "H.264"],
        sensorSizes: {
          "4K UHD": "35.90 x 24.00 mm",
          "HD": "35.90 x 24.00 mm"
        },
        pixelResolutions: {
          "4K UHD": "3840 x 2160",
          "HD": "1920 x 1080"
        },
        aspectRatios: {
          "4K UHD": {
            recorded: "16:9",
            sensor: "3:2"
          },
          "HD": {
            recorded: "16:9",
            sensor: "3:2"
          }
        }
      },
      "Z6 II": {
        formats: ["4K UHD", "HD"],
        codecs: ["ProRes 422 HQ", "ProRes 422", "H.265", "H.264"],
        sensorSizes: {
          "4K UHD": "35.90 x 24.00 mm",
          "HD": "35.90 x 24.00 mm"
        },
        pixelResolutions: {
          "4K UHD": "3840 x 2160",
          "HD": "1920 x 1080"
        },
        aspectRatios: {
          "4K UHD": {
            recorded: "16:9",
            sensor: "3:2"
          },
          "HD": {
            recorded: "16:9",
            sensor: "3:2"
          }
        }
      },
      "Z7": {
        formats: ["4K UHD", "HD"],
        codecs: ["ProRes 422 HQ", "ProRes 422", "H.265", "H.264"],
        sensorSizes: {
          "4K UHD": "35.90 x 24.00 mm",
          "HD": "35.90 x 24.00 mm"
        },
        pixelResolutions: {
          "4K UHD": "3840 x 2160",
          "HD": "1920 x 1080"
        },
        aspectRatios: {
          "4K UHD": {
            recorded: "16:9",
            sensor: "3:2"
          },
          "HD": {
            recorded: "16:9",
            sensor: "3:2"
          }
        }
      },
      "Z7 II": {
        formats: ["4K UHD", "HD"],
        codecs: ["ProRes 422 HQ", "ProRes 422", "H.265", "H.264"],
        sensorSizes: {
          "4K UHD": "35.90 x 24.00 mm",
          "HD": "35.90 x 24.00 mm"
        },
        pixelResolutions: {
          "4K UHD": "3840 x 2160",
          "HD": "1920 x 1080"
        },
        aspectRatios: {
          "4K UHD": {
            recorded: "16:9",
            sensor: "3:2"
          },
          "HD": {
            recorded: "16:9",
            sensor: "3:2"
          }
        }
      },
      "Z9": {
        formats: ["8K", "4K DCI", "4K UHD", "HD"],
        codecs: ["N-RAW", "ProRes 422 HQ", "H.265", "H.264"],
        sensorSizes: {
          "8K": "35.90 x 24.00 mm",
          "4K DCI": "35.90 x 24.00 mm",
          "4K UHD": "35.90 x 24.00 mm",
          "HD": "35.90 x 24.00 mm"
        },
        pixelResolutions: {
          "8K": "7680 x 4320",
          "4K DCI": "4096 x 2160",
          "4K UHD": "3840 x 2160",
          "HD": "1920 x 1080"
        },
        aspectRatios: {
          "8K": {
            recorded: "16:9",
            sensor: "3:2"
          },
          "4K DCI": {
            recorded: "17:9",
            sensor: "3:2"
          },
          "4K UHD": {
            recorded: "16:9",
            sensor: "3:2"
          },
          "HD": {
            recorded: "16:9",
            sensor: "3:2"
          }
        }
      },
      "Z8": {
        formats: ["8K", "4K DCI", "4K UHD", "HD"],
        codecs: ["N-RAW", "ProRes 422 HQ", "H.265", "H.264"],
        sensorSizes: {
          "8K": "35.90 x 24.00 mm",
          "4K DCI": "35.90 x 24.00 mm",
          "4K UHD": "35.90 x 24.00 mm",
          "HD": "35.90 x 24.00 mm"
        },
        pixelResolutions: {
          "8K": "7680 x 4320",
          "4K DCI": "4096 x 2160",
          "4K UHD": "3840 x 2160",
          "HD": "1920 x 1080"
        },
        aspectRatios: {
          "8K": {
            recorded: "16:9",
            sensor: "3:2"
          },
          "4K DCI": {
            recorded: "17:9",
            sensor: "3:2"
          },
          "4K UHD": {
            recorded: "16:9",
            sensor: "3:2"
          },
          "HD": {
            recorded: "16:9",
            sensor: "3:2"
          }
        }
      }
    }
  },
  "Z CAM": {
    models: {
      "E2-M4": {
        formats: ["4K DCI", "4K UHD", "2K", "HD"],
        codecs: ["Z-RAW", "ProRes 422 HQ", "ProRes 422", "H.265", "H.264"],
        sensorSizes: {
          "4K DCI": "17.30 x 13.00 mm",
          "4K UHD": "17.30 x 13.00 mm",
          "2K": "17.30 x 13.00 mm",
          "HD": "17.30 x 13.00 mm"
        },
        pixelResolutions: {
          "4K DCI": "4096 x 3072",
          "4K UHD": "3840 x 2880",
          "2K": "2048 x 1536",
          "HD": "1920 x 1440"
        },
        aspectRatios: {
          "4K DCI": {
            recorded: "4:3",
            sensor: "4:3"
          },
          "4K UHD": {
            recorded: "4:3",
            sensor: "4:3"
          },
          "2K": {
            recorded: "4:3",
            sensor: "4:3"
          },
          "HD": {
            recorded: "4:3",
            sensor: "4:3"
          }
        }
      },
      "E2-S6": {
        formats: ["6K", "4K DCI", "4K UHD", "2K", "HD"],
        codecs: ["Z-RAW", "ProRes 422 HQ", "ProRes 422", "H.265", "H.264"],
        sensorSizes: {
          "6K": "23.10 x 12.99 mm",
          "4K DCI": "23.10 x 12.99 mm",
          "4K UHD": "23.10 x 12.99 mm",
          "2K": "23.10 x 12.99 mm",
          "HD": "23.10 x 12.99 mm"
        },
        pixelResolutions: {
          "6K": "6016 x 3384",
          "4K DCI": "4096 x 2304",
          "4K UHD": "3840 x 2160",
          "2K": "2048 x 1152",
          "HD": "1920 x 1080"
        },
        aspectRatios: {
          "6K": {
            recorded: "16:9",
            sensor: "17:9"
          },
          "4K DCI": {
            recorded: "16:9",
            sensor: "17:9"
          },
          "4K UHD": {
            recorded: "16:9",
            sensor: "17:9"
          },
          "2K": {
            recorded: "16:9",
            sensor: "17:9"
          },
          "HD": {
            recorded: "16:9",
            sensor: "17:9"
          }
        }
      },
      "E2-F6": {
        formats: ["6K FF", "4K DCI", "4K UHD", "2K", "HD"],
        codecs: ["Z-RAW", "ProRes 422 HQ", "ProRes 422", "H.265", "H.264"],
        sensorSizes: {
          "6K FF": "36.00 x 24.00 mm",
          "4K DCI": "36.00 x 24.00 mm",
          "4K UHD": "36.00 x 24.00 mm",
          "2K": "36.00 x 24.00 mm",
          "HD": "36.00 x 24.00 mm"
        },
        pixelResolutions: {
          "6K FF": "6016 x 4016",
          "4K DCI": "4096 x 2160",
          "4K UHD": "3840 x 2160",
          "2K": "2048 x 1080",
          "HD": "1920 x 1080"
        },
        aspectRatios: {
          "6K FF": {
            recorded: "3:2",
            sensor: "3:2"
          },
          "4K DCI": {
            recorded: "17:9",
            sensor: "3:2"
          },
          "4K UHD": {
            recorded: "16:9",
            sensor: "3:2"
          },
          "2K": {
            recorded: "17:9",
            sensor: "3:2"
          },
          "HD": {
            recorded: "16:9",
            sensor: "3:2"
          }
        }
      },
      "E2-F8": {
        formats: ["8K DCI", "8K UHD", "6K DCI", "6K UHD", "4K UHD", "2K", "HD"],
        codecs: ["Z-RAW", "ProRes 422 HQ", "ProRes 422", "H.265", "H.264"],
        sensorSizes: {
          "8K DCI": "36.00 x 24.00 mm",
          "8K UHD": "36.00 x 24.00 mm",
          "6K DCI": "36.00 x 24.00 mm",
          "6K UHD": "36.00 x 24.00 mm",
          "4K UHD": "36.00 x 24.00 mm",
          "2K": "36.00 x 24.00 mm",
          "HD": "36.00 x 24.00 mm"
        },
        pixelResolutions: {
          "8K DCI": "8192 x 4320",
          "8K UHD": "7680 x 4320",
          "6K DCI": "6144 x 3240",
          "6K UHD": "5760 x 3240",
          "4K UHD": "3840 x 2160",
          "2K": "2048 x 1080",
          "HD": "1920 x 1080"
        },
        aspectRatios: {
          "8K DCI": { recorded: "17:9", sensor: "3:2" },
          "8K UHD": { recorded: "16:9", sensor: "3:2" },
          "6K DCI": { recorded: "17:9", sensor: "3:2" },
          "6K UHD": { recorded: "16:9", sensor: "3:2" },
          "4K UHD": { recorded: "16:9", sensor: "3:2" },
          "2K": { recorded: "17:9", sensor: "3:2" },
          "HD": { recorded: "16:9", sensor: "3:2" }
        }
      }
    }
  },
  "WEISSCAM": {
    models: {
      "HS-2": {
        formats: ["2K 4:3", "1080p 16:9", "720p 16:9"],
        codecs: ["WEISSCAM RAW", "HD-SDI (YCbCr 4:2:2)"],
        sensorSizes: {
          "2K 4:3": "22.18 x 22.18 mm",
          "1080p 16:9": "Not available",
          "720p 16:9": "Not available"
        },
        pixelResolutions: {
          "2K 4:3": "2048 x 1536",
          "1080p 16:9": "1920 x 1080",
          "720p 16:9": "1280 x 720"
        },
        aspectRatios: {
          "2K 4:3": { recorded: "4:3", sensor: "4:3" },
          "1080p 16:9": { recorded: "16:9", sensor: "16:9" },
          "720p 16:9": { recorded: "16:9", sensor: "16:9" }
        }
      },
      "HS-1": {
        formats: ["1280 x 1024 (MAX)", "HD 720p", "SD PAL 720x576"],
        codecs: ["DPX/TIFF", "HD-SDI (YCbCr 4:2:2)"],
        sensorSizes: {
          "1280 x 1024 (MAX)": "15.00 x 12.00 mm",
          "HD 720p": "15.00 x 12.00 mm",
          "SD PAL 720x576": "15.00 x 12.00 mm"
        },
        pixelResolutions: {
          "1280 x 1024 (MAX)": "1280 x 1024",
          "HD 720p": "1280 x 720",
          "SD PAL 720x576": "720 x 576"
        },
        aspectRatios: {
          "1280 x 1024 (MAX)": { recorded: "5:4", sensor: "5:4" },
          "HD 720p": { recorded: "16:9", sensor: "16:9" },
          "SD PAL 720x576": { recorded: "4:3", sensor: "4:3" }
        }
      }
    }
  },
  "GoPro": {
    models: {
      "HERO12 Black": {
        formats: ["5.3K", "4K UHD", "2.7K", "HD"],
        codecs: ["H.265", "H.264", "MP4"],
        sensorSizes: {
          "5.3K": "6.80 x 4.70 mm",
          "4K UHD": "6.80 x 4.70 mm",
          "2.7K": "6.80 x 4.70 mm",
          "HD": "6.80 x 4.70 mm"
        },
        pixelResolutions: {
          "5.3K": "5312 x 2988",
          "4K UHD": "3840 x 2160",
          "2.7K": "2704 x 1520",
          "HD": "1920 x 1080"
        },
        aspectRatios: {
          "5.3K": { recorded: "16:9", sensor: "4:3" },
          "4K UHD": { recorded: "16:9", sensor: "4:3" },
          "2.7K": { recorded: "16:9", sensor: "4:3" },
          "HD": { recorded: "16:9", sensor: "4:3" }
        }
      },
      "HERO11 Black": {
        formats: ["5.3K", "4K UHD", "2.7K", "HD"],
        codecs: ["H.265", "H.264", "MP4"],
        sensorSizes: {
          "5.3K": "6.80 x 4.70 mm",
          "4K UHD": "6.80 x 4.70 mm",
          "2.7K": "6.80 x 4.70 mm",
          "HD": "6.80 x 4.70 mm"
        },
        pixelResolutions: {
          "5.3K": "5312 x 2988",
          "4K UHD": "3840 x 2160",
          "2.7K": "2704 x 1520",
          "HD": "1920 x 1080"
        },
        aspectRatios: {
          "5.3K": { recorded: "16:9", sensor: "4:3" },
          "4K UHD": { recorded: "16:9", sensor: "4:3" },
          "2.7K": { recorded: "16:9", sensor: "4:3" },
          "HD": { recorded: "16:9", sensor: "4:3" }
        }
      },
      "HERO10 Black": {
        formats: ["5.3K", "4K UHD", "2.7K", "HD"],
        codecs: ["H.265", "H.264", "MP4"],
        sensorSizes: {
          "5.3K": "6.80 x 4.70 mm",
          "4K UHD": "6.80 x 4.70 mm",
          "2.7K": "6.80 x 4.70 mm",
          "HD": "6.80 x 4.70 mm"
        },
        pixelResolutions: {
          "5.3K": "5312 x 2988",
          "4K UHD": "3840 x 2160",
          "2.7K": "2704 x 1520",
          "HD": "1920 x 1080"
        },
        aspectRatios: {
          "5.3K": { recorded: "16:9", sensor: "4:3" },
          "4K UHD": { recorded: "16:9", sensor: "4:3" },
          "2.7K": { recorded: "16:9", sensor: "4:3" },
          "HD": { recorded: "16:9", sensor: "4:3" }
        }
      },
      "HERO9 Black": {
        formats: ["5K", "4K UHD", "2.7K", "HD"],
        codecs: ["H.265", "H.264", "MP4"],
        sensorSizes: {
          "5K": "6.30 x 4.70 mm",
          "4K UHD": "6.30 x 4.70 mm",
          "2.7K": "6.30 x 4.70 mm",
          "HD": "6.30 x 4.70 mm"
        },
        pixelResolutions: {
          "5K": "5120 x 2880",
          "4K UHD": "3840 x 2160",
          "2.7K": "2704 x 1520",
          "HD": "1920 x 1080"
        },
        aspectRatios: {
          "5K": { recorded: "16:9", sensor: "4:3" },
          "4K UHD": { recorded: "16:9", sensor: "4:3" },
          "2.7K": { recorded: "16:9", sensor: "4:3" },
          "HD": { recorded: "16:9", sensor: "4:3" }
        }
      },
      "HERO8 Black": {
        formats: ["4K UHD", "2.7K", "HD"],
        codecs: ["H.265", "H.264", "MP4"],
        sensorSizes: {
          "4K UHD": "6.17 x 4.55 mm",
          "2.7K": "6.17 x 4.55 mm",
          "HD": "6.17 x 4.55 mm"
        },
        pixelResolutions: {
          "4K UHD": "3840 x 2160",
          "2.7K": "2704 x 1520",
          "HD": "1920 x 1080"
        },
        aspectRatios: {
          "4K UHD": { recorded: "16:9", sensor: "4:3" },
          "2.7K": { recorded: "16:9", sensor: "4:3" },
          "HD": { recorded: "16:9", sensor: "4:3" }
        }
      },
      "HERO7 Black": {
        formats: ["4K UHD", "2.7K", "HD"],
        codecs: ["H.265", "H.264", "MP4"],
        sensorSizes: {
          "4K UHD": "6.17 x 4.55 mm",
          "2.7K": "6.17 x 4.55 mm",
          "HD": "6.17 x 4.55 mm"
        },
        pixelResolutions: {
          "4K UHD": "3840 x 2160",
          "2.7K": "2704 x 1520",
          "HD": "1920 x 1080"
        },
        aspectRatios: {
          "4K UHD": { recorded: "16:9", sensor: "4:3" },
          "2.7K": { recorded: "16:9", sensor: "4:3" },
          "HD": { recorded: "16:9", sensor: "4:3" }
        }
      },
      "MAX": {
        formats: ["5.6K 360", "4K 360"],
        codecs: ["H.265", "MP4"],
        sensorSizes: {
          "5.6K 360": "6.40 x 4.80 mm",
          "4K 360": "6.40 x 4.80 mm"
        },
        pixelResolutions: {
          "5.6K 360": "4992 x 2496",
          "4K 360": "3840 x 1920"
        },
        aspectRatios: {
          "5.6K 360": { recorded: "2:1", sensor: "2:1" },
          "4K 360": { recorded: "2:1", sensor: "2:1" }
        }
      },
      "Fusion": {
        formats: ["5.2K 360", "4K 360"],
        codecs: ["H.264", "MP4"],
        sensorSizes: {
          "5.2K 360": "6.17 x 4.55 mm",
          "4K 360": "6.17 x 4.55 mm"
        },
        pixelResolutions: {
          "5.2K 360": "5120 x 2560",
          "4K 360": "3840 x 1920"
        },
        aspectRatios: {
          "5.2K 360": { recorded: "2:1", sensor: "2:1" },
          "4K 360": { recorded: "2:1", sensor: "2:1" }
        }
      }
    }
  },
  "DJI": {
    models: {
      "Osmo Action 4": {
        formats: ["4K UHD", "2.7K", "HD"],
        codecs: ["H.265", "H.264", "MP4"],
        sensorSizes: {
          "4K UHD": "9.60 x 7.20 mm",
          "2.7K": "9.60 x 7.20 mm",
          "HD": "9.60 x 7.20 mm"
        },
        pixelResolutions: {
          "4K UHD": "3840 x 2160",
          "2.7K": "2704 x 1520",
          "HD": "1920 x 1080"
        },
        aspectRatios: {
          "4K UHD": { recorded: "16:9", sensor: "4:3" },
          "2.7K": { recorded: "16:9", sensor: "4:3" },
          "HD": { recorded: "16:9", sensor: "4:3" }
        }
      },
      "Osmo Action 3": {
        formats: ["4K UHD", "2.7K", "HD"],
        codecs: ["H.265", "H.264", "MP4"],
        sensorSizes: {
          "4K UHD": "7.40 x 5.60 mm",
          "2.7K": "7.40 x 5.60 mm",
          "HD": "7.40 x 5.60 mm"
        },
        pixelResolutions: {
          "4K UHD": "3840 x 2160",
          "2.7K": "2704 x 1520",
          "HD": "1920 x 1080"
        },
        aspectRatios: {
          "4K UHD": { recorded: "16:9", sensor: "4:3" },
          "2.7K": { recorded: "16:9", sensor: "4:3" },
          "HD": { recorded: "16:9", sensor: "4:3" }
        }
      },
      "Osmo Action 2": {
        formats: ["4K UHD", "2.7K", "HD"],
        codecs: ["H.265", "H.264", "MP4"],
        sensorSizes: {
          "4K UHD": "7.40 x 5.60 mm",
          "2.7K": "7.40 x 5.60 mm",
          "HD": "7.40 x 5.60 mm"
        },
        pixelResolutions: {
          "4K UHD": "3840 x 2160",
          "2.7K": "2704 x 1520",
          "HD": "1920 x 1080"
        },
        aspectRatios: {
          "4K UHD": { recorded: "16:9", sensor: "4:3" },
          "2.7K": { recorded: "16:9", sensor: "4:3" },
          "HD": { recorded: "16:9", sensor: "4:3" }
        }
      },
      "Osmo Action": {
        formats: ["4K UHD", "2.7K", "HD"],
        codecs: ["H.264", "MP4"],
        sensorSizes: {
          "4K UHD": "6.17 x 4.55 mm",
          "2.7K": "6.17 x 4.55 mm",
          "HD": "6.17 x 4.55 mm"
        },
        pixelResolutions: {
          "4K UHD": "3840 x 2160",
          "2.7K": "2704 x 1520",
          "HD": "1920 x 1080"
        },
        aspectRatios: {
          "4K UHD": { recorded: "16:9", sensor: "4:3" },
          "2.7K": { recorded: "16:9", sensor: "4:3" },
          "HD": { recorded: "16:9", sensor: "4:3" }
        }
      },
      "Osmo Pocket 3": {
        formats: ["4K UHD", "2.7K", "HD"],
        codecs: ["H.265", "H.264", "MP4"],
        sensorSizes: {
          "4K UHD": "13.20 x 8.80 mm",
          "2.7K": "13.20 x 8.80 mm",
          "HD": "13.20 x 8.80 mm"
        },
        pixelResolutions: {
          "4K UHD": "3840 x 2160",
          "2.7K": "2704 x 1520",
          "HD": "1920 x 1080"
        },
        aspectRatios: {
          "4K UHD": { recorded: "16:9", sensor: "3:2" },
          "2.7K": { recorded: "16:9", sensor: "3:2" },
          "HD": { recorded: "16:9", sensor: "3:2" }
        }
      },
      "Osmo Pocket 2": {
        formats: ["4K UHD", "2.7K", "HD"],
        codecs: ["H.265", "H.264", "MP4"],
        sensorSizes: {
          "4K UHD": "6.40 x 4.80 mm",
          "2.7K": "6.40 x 4.80 mm",
          "HD": "6.40 x 4.80 mm"
        },
        pixelResolutions: {
          "4K UHD": "3840 x 2160",
          "2.7K": "2704 x 1520",
          "HD": "1920 x 1080"
        },
        aspectRatios: {
          "4K UHD": { recorded: "16:9", sensor: "4:3" },
          "2.7K": { recorded: "16:9", sensor: "4:3" },
          "HD": { recorded: "16:9", sensor: "4:3" }
        }
      },
      "Osmo Pocket": {
        formats: ["4K UHD", "2.7K", "HD"],
        codecs: ["H.264", "MP4"],
        sensorSizes: {
          "4K UHD": "6.17 x 4.55 mm",
          "2.7K": "6.17 x 4.55 mm",
          "HD": "6.17 x 4.55 mm"
        },
        pixelResolutions: {
          "4K UHD": "3840 x 2160",
          "2.7K": "2704 x 1520",
          "HD": "1920 x 1080"
        },
        aspectRatios: {
          "4K UHD": { recorded: "16:9", sensor: "4:3" },
          "2.7K": { recorded: "16:9", sensor: "4:3" },
          "HD": { recorded: "16:9", sensor: "4:3" }
        }
      },
      "Mavic 3": {
        formats: ["5.1K", "4K UHD", "2.7K", "HD"],
        codecs: ["H.265", "H.264", "MP4"],
        sensorSizes: {
          "5.1K": "17.30 x 13.00 mm",
          "4K UHD": "17.30 x 13.00 mm",
          "2.7K": "17.30 x 13.00 mm",
          "HD": "17.30 x 13.00 mm"
        },
        pixelResolutions: {
          "5.1K": "5120 x 2700",
          "4K UHD": "3840 x 2160",
          "2.7K": "2704 x 1520",
          "HD": "1920 x 1080"
        },
        aspectRatios: {
          "5.1K": { recorded: "16:9", sensor: "4:3" },
          "4K UHD": { recorded: "16:9", sensor: "4:3" },
          "2.7K": { recorded: "16:9", sensor: "4:3" },
          "HD": { recorded: "16:9", sensor: "4:3" }
        }
      },
      "Mavic 3 Classic": {
        formats: ["5.1K", "4K UHD", "2.7K", "HD"],
        codecs: ["H.265", "H.264", "MP4"],
        sensorSizes: {
          "5.1K": "17.30 x 13.00 mm",
          "4K UHD": "17.30 x 13.00 mm",
          "2.7K": "17.30 x 13.00 mm",
          "HD": "17.30 x 13.00 mm"
        },
        pixelResolutions: {
          "5.1K": "5120 x 2700",
          "4K UHD": "3840 x 2160",
          "2.7K": "2704 x 1520",
          "HD": "1920 x 1080"
        },
        aspectRatios: {
          "5.1K": { recorded: "16:9", sensor: "4:3" },
          "4K UHD": { recorded: "16:9", sensor: "4:3" },
          "2.7K": { recorded: "16:9", sensor: "4:3" },
          "HD": { recorded: "16:9", sensor: "4:3" }
        }
      },
      "Mavic 3 Pro": {
        formats: ["5.1K", "4K UHD", "2.7K", "HD"],
        codecs: ["H.265", "H.264", "MP4"],
        sensorSizes: {
          "5.1K": "17.30 x 13.00 mm",
          "4K UHD": "17.30 x 13.00 mm",
          "2.7K": "17.30 x 13.00 mm",
          "HD": "17.30 x 13.00 mm"
        },
        pixelResolutions: {
          "5.1K": "5120 x 2700",
          "4K UHD": "3840 x 2160",
          "2.7K": "2704 x 1520",
          "HD": "1920 x 1080"
        },
        aspectRatios: {
          "5.1K": { recorded: "16:9", sensor: "4:3" },
          "4K UHD": { recorded: "16:9", sensor: "4:3" },
          "2.7K": { recorded: "16:9", sensor: "4:3" },
          "HD": { recorded: "16:9", sensor: "4:3" }
        }
      },
      "Air 3": {
        formats: ["4K UHD", "2.7K", "HD"],
        codecs: ["H.265", "H.264", "MP4"],
        sensorSizes: {
          "4K UHD": "9.60 x 7.20 mm",
          "2.7K": "9.60 x 7.20 mm",
          "HD": "9.60 x 7.20 mm"
        },
        pixelResolutions: {
          "4K UHD": "3840 x 2160",
          "2.7K": "2704 x 1520",
          "HD": "1920 x 1080"
        },
        aspectRatios: {
          "4K UHD": { recorded: "16:9", sensor: "4:3" },
          "2.7K": { recorded: "16:9", sensor: "4:3" },
          "HD": { recorded: "16:9", sensor: "4:3" }
        }
      },
      "Mini 4 Pro": {
        formats: ["4K UHD", "2.7K", "HD"],
        codecs: ["H.265", "H.264", "MP4"],
        sensorSizes: {
          "4K UHD": "9.60 x 7.20 mm",
          "2.7K": "9.60 x 7.20 mm",
          "HD": "9.60 x 7.20 mm"
        },
        pixelResolutions: {
          "4K UHD": "3840 x 2160",
          "2.7K": "2704 x 1520",
          "HD": "1920 x 1080"
        },
        aspectRatios: {
          "4K UHD": { recorded: "16:9", sensor: "4:3" },
          "2.7K": { recorded: "16:9", sensor: "4:3" },
          "HD": { recorded: "16:9", sensor: "4:3" }
        }
      },
      "Avata 2": {
        formats: ["4K UHD", "2.7K", "HD"],
        codecs: ["H.265", "H.264", "MP4"],
        sensorSizes: {
          "4K UHD": "9.60 x 7.20 mm",
          "2.7K": "9.60 x 7.20 mm",
          "HD": "9.60 x 7.20 mm"
        },
        pixelResolutions: {
          "4K UHD": "3840 x 2160",
          "2.7K": "2704 x 1520",
          "HD": "1920 x 1080"
        },
        aspectRatios: {
          "4K UHD": { recorded: "16:9", sensor: "4:3" },
          "2.7K": { recorded: "16:9", sensor: "4:3" },
          "HD": { recorded: "16:9", sensor: "4:3" }
        }
      },
      "Inspire 3": {
        formats: ["8K", "4K DCI", "4K UHD", "HD"],
        codecs: ["ProRes 422 HQ", "ProRes 422", "H.265", "H.264", "MP4"],
        sensorSizes: {
          "8K": "36.00 x 24.00 mm",
          "4K DCI": "36.00 x 24.00 mm",
          "4K UHD": "36.00 x 24.00 mm",
          "HD": "36.00 x 24.00 mm"
        },
        pixelResolutions: {
          "8K": "8192 x 4320",
          "4K DCI": "4096 x 2160",
          "4K UHD": "3840 x 2160",
          "HD": "1920 x 1080"
        },
        aspectRatios: {
          "8K": { recorded: "16:9", sensor: "3:2" },
          "4K DCI": { recorded: "17:9", sensor: "3:2" },
          "4K UHD": { recorded: "16:9", sensor: "3:2" },
          "HD": { recorded: "16:9", sensor: "3:2" }
        }
      }
    }
  },
  "Insta360": {
    models: {
      "X3": {
        formats: ["5.7K 360", "4K 360"],
        codecs: ["H.265", "H.264", "MP4"],
        sensorSizes: {
          "5.7K 360": "6.40 x 4.80 mm",
          "4K 360": "6.40 x 4.80 mm"
        },
        pixelResolutions: {
          "5.7K 360": "5760 x 2880",
          "4K 360": "3840 x 1920"
        },
        aspectRatios: {
          "5.7K 360": { recorded: "2:1", sensor: "2:1" },
          "4K 360": { recorded: "2:1", sensor: "2:1" }
        }
      },
      "One X2": {
        formats: ["5.7K 360", "4K 360"],
        codecs: ["H.265", "H.264", "MP4"],
        sensorSizes: {
          "5.7K 360": "6.40 x 4.80 mm",
          "4K 360": "6.40 x 4.80 mm"
        },
        pixelResolutions: {
          "5.7K 360": "5760 x 2880",
          "4K 360": "3840 x 1920"
        },
        aspectRatios: {
          "5.7K 360": { recorded: "2:1", sensor: "2:1" },
          "4K 360": { recorded: "2:1", sensor: "2:1" }
        }
      },
      "X4": {
        formats: ["8K 360", "5.7K 360"],
        codecs: ["H.265", "H.264", "MP4"],
        sensorSizes: {
          "8K 360": "6.40 x 4.80 mm",
          "5.7K 360": "6.40 x 4.80 mm"
        },
        pixelResolutions: {
          "8K 360": "7680 x 3840",
          "5.7K 360": "5760 x 2880"
        },
        aspectRatios: {
          "8K 360": { recorded: "2:1", sensor: "2:1" },
          "5.7K 360": { recorded: "2:1", sensor: "2:1" }
        }
      },
      "X5": {
        formats: ["8K 360", "5.7K 360"],
        codecs: ["H.265", "H.264", "MP4"],
        sensorSizes: {
          "8K 360": "6.40 x 4.80 mm",
          "5.7K 360": "6.40 x 4.80 mm"
        },
        pixelResolutions: {
          "8K 360": "7680 x 3840",
          "5.7K 360": "5760 x 2880"
        },
        aspectRatios: {
          "8K 360": { recorded: "2:1", sensor: "2:1" },
          "5.7K 360": { recorded: "2:1", sensor: "2:1" }
        }
      },
      "One RS 1-Inch 360": {
        formats: ["6K 360", "4K 360"],
        codecs: ["H.265", "H.264", "MP4"],
        sensorSizes: {
          "6K 360": "13.20 x 8.80 mm",
          "4K 360": "13.20 x 8.80 mm"
        },
        pixelResolutions: {
          "6K 360": "6144 x 3072",
          "4K 360": "3840 x 1920"
        },
        aspectRatios: {
          "6K 360": { recorded: "2:1", sensor: "2:1" },
          "4K 360": { recorded: "2:1", sensor: "2:1" }
        }
      },
      "GO 3": {
        formats: ["2.7K", "HD"],
        codecs: ["H.265", "H.264", "MP4"],
        sensorSizes: {
          "2.7K": "6.40 x 4.80 mm",
          "HD": "6.40 x 4.80 mm"
        },
        pixelResolutions: {
          "2.7K": "2704 x 1520",
          "HD": "1920 x 1080"
        },
        aspectRatios: {
          "2.7K": { recorded: "16:9", sensor: "4:3" },
          "HD": { recorded: "16:9", sensor: "4:3" }
        }
      },
      "GO 2": {
        formats: ["2.7K", "HD"],
        codecs: ["H.264", "MP4"],
        sensorSizes: {
          "2.7K": "6.40 x 4.80 mm",
          "HD": "6.40 x 4.80 mm"
        },
        pixelResolutions: {
          "2.7K": "2704 x 1520",
          "HD": "1920 x 1080"
        },
        aspectRatios: {
          "2.7K": { recorded: "16:9", sensor: "4:3" },
          "HD": { recorded: "16:9", sensor: "4:3" }
        }
      },
      "One X": {
        formats: ["5.7K 360", "4K 360"],
        codecs: ["H.265", "H.264", "MP4"],
        sensorSizes: {
          "5.7K 360": "6.40 x 4.80 mm",
          "4K 360": "6.40 x 4.80 mm"
        },
        pixelResolutions: {
          "5.7K 360": "5760 x 2880",
          "4K 360": "3840 x 1920"
        },
        aspectRatios: {
          "5.7K 360": { recorded: "2:1", sensor: "2:1" },
          "4K 360": { recorded: "2:1", sensor: "2:1" }
        }
      },
      "One R 360": {
        formats: ["5.7K 360", "4K 360"],
        codecs: ["H.265", "H.264", "MP4"],
        sensorSizes: {
          "5.7K 360": "6.40 x 4.80 mm",
          "4K 360": "6.40 x 4.80 mm"
        },
        pixelResolutions: {
          "5.7K 360": "5760 x 2880",
          "4K 360": "3840 x 1920"
        },
        aspectRatios: {
          "5.7K 360": { recorded: "2:1", sensor: "2:1" },
          "4K 360": { recorded: "2:1", sensor: "2:1" }
        }
      },
      "One RS 4K": {
        formats: ["4K UHD", "HD"],
        codecs: ["H.265", "H.264", "MP4"],
        sensorSizes: {
          "4K UHD": "6.40 x 4.80 mm",
          "HD": "6.40 x 4.80 mm"
        },
        pixelResolutions: {
          "4K UHD": "3840 x 2160",
          "HD": "1920 x 1080"
        },
        aspectRatios: {
          "4K UHD": { recorded: "16:9", sensor: "4:3" },
          "HD": { recorded: "16:9", sensor: "4:3" }
        }
      },
      "Pro 2": {
        formats: ["8K 360", "5.7K 360"],
        codecs: ["H.265", "H.264", "MP4"],
        sensorSizes: {
          "8K 360": "6.17 x 4.55 mm",
          "5.7K 360": "6.17 x 4.55 mm"
        },
        pixelResolutions: {
          "8K 360": "7680 x 3840",
          "5.7K 360": "5760 x 2880"
        },
        aspectRatios: {
          "8K 360": { recorded: "2:1", sensor: "2:1" },
          "5.7K 360": { recorded: "2:1", sensor: "2:1" }
        }
      },
      "Titan": {
        formats: ["11K 360", "8K 360"],
        codecs: ["H.265", "H.264", "MP4"],
        sensorSizes: {
          "11K 360": "17.30 x 13.00 mm",
          "8K 360": "17.30 x 13.00 mm"
        },
        pixelResolutions: {
          "11K 360": "10560 x 5280",
          "8K 360": "7680 x 3840"
        },
        aspectRatios: {
          "11K 360": { recorded: "2:1", sensor: "2:1" },
          "8K 360": { recorded: "2:1", sensor: "2:1" }
        }
      }
    }
  },
  "Ricoh Theta": {
    models: {
      "THETA Z1": {
        formats: ["4K 360", "HD 360"],
        codecs: ["H.265", "H.264", "MP4"],
        sensorSizes: {
          "4K 360": "13.20 x 8.80 mm",
          "HD 360": "13.20 x 8.80 mm"
        },
        pixelResolutions: {
          "4K 360": "3840 x 1920",
          "HD 360": "1920 x 960"
        },
        aspectRatios: {
          "4K 360": { recorded: "2:1", sensor: "2:1" },
          "HD 360": { recorded: "2:1", sensor: "2:1" }
        }
      },
      "THETA X": {
        formats: ["5.7K 360", "4K 360"],
        codecs: ["H.265", "H.264", "MP4"],
        sensorSizes: {
          "5.7K 360": "6.40 x 4.80 mm",
          "4K 360": "6.40 x 4.80 mm"
        },
        pixelResolutions: {
          "5.7K 360": "5760 x 2880",
          "4K 360": "3840 x 1920"
        },
        aspectRatios: {
          "5.7K 360": { recorded: "2:1", sensor: "2:1" },
          "4K 360": { recorded: "2:1", sensor: "2:1" }
        }
      },
      "THETA V": {
        formats: ["4K 360"],
        codecs: ["H.265", "H.264", "MP4"],
        sensorSizes: {
          "4K 360": "6.40 x 4.80 mm"
        },
        pixelResolutions: {
          "4K 360": "3840 x 1920"
        },
        aspectRatios: {
          "4K 360": { recorded: "2:1", sensor: "2:1" }
        }
      },
      "THETA SC2": {
        formats: ["4K 360"],
        codecs: ["H.265", "H.264", "MP4"],
        sensorSizes: {
          "4K 360": "6.40 x 4.80 mm"
        },
        pixelResolutions: {
          "4K 360": "3840 x 1920"
        },
        aspectRatios: {
          "4K 360": { recorded: "2:1", sensor: "2:1" }
        }
      },
      "THETA S": {
        formats: ["HD 360"],
        codecs: ["H.264", "MP4"],
        sensorSizes: {
          "HD 360": "6.40 x 4.80 mm"
        },
        pixelResolutions: {
          "HD 360": "1920 x 960"
        },
        aspectRatios: {
          "HD 360": { recorded: "2:1", sensor: "2:1" }
        }
      },
      "THETA SC": {
        formats: ["HD 360"],
        codecs: ["H.264", "MP4"],
        sensorSizes: {
          "HD 360": "6.40 x 4.80 mm"
        },
        pixelResolutions: {
          "HD 360": "1920 x 960"
        },
        aspectRatios: {
          "HD 360": { recorded: "2:1", sensor: "2:1" }
        }
      }
    }
  }
};

// Hilfsfunktionen zum Parsen und Berechnen
const parseMm = (mmString) => {
  if (!mmString || typeof mmString !== 'string') return null;
  if (mmString.toLowerCase().includes('nicht verfügbar') || mmString.toLowerCase().includes('not available')) return null;
  const match = mmString.match(/(\d+\.\d+|\d+)\s*x\s*(\d+\.\d+|\d+)\s*mm/i);
  if (!match) return null;
  const width = parseFloat(match[1]);
  const height = parseFloat(match[2]);
  if (isNaN(width) || isNaN(height)) return null;
  return { width, height };
};

const parsePixels = (pxString) => {
  if (!pxString || typeof pxString !== 'string') return null;
  const match = pxString.match(/(\d+)\s*x\s*(\d+)/i);
  if (!match) return null;
  const width = parseInt(match[1], 10);
  const height = parseInt(match[2], 10);
  if (isNaN(width) || isNaN(height)) return null;
  return { width, height };
};

// Finde größten mm-Sensorbereich eines Modells
const getMaxSensorDimsForModel = (manufacturer, model) => {
  try {
    const camera = cameraDatabase?.[manufacturer]?.models?.[model];
    if (!camera || !camera.sensorSizes) return null;
    let best = null;
    for (const key of Object.keys(camera.sensorSizes)) {
      const dims = parseMm(camera.sensorSizes[key]);
      if (!dims) continue;
      const area = dims.width * dims.height;
      if (!best || area > best.area) best = { ...dims, area };
    }
    return best ? { width: best.width, height: best.height } : null;
  } catch {
    return null;
  }
};

// Finde größte Pixelauflösung eines Modells
const getMaxPixelResolutionForModel = (manufacturer, model) => {
  try {
    const camera = cameraDatabase?.[manufacturer]?.models?.[model];
    if (!camera || !camera.pixelResolutions) return null;
    let best = null;
    for (const key of Object.keys(camera.pixelResolutions)) {
      const dims = parsePixels(camera.pixelResolutions[key]);
      if (!dims) continue;
      const area = dims.width * dims.height;
      if (!best || area > best.area) best = { ...dims, area };
    }
    return best ? { width: best.width, height: best.height } : null;
  } catch {
    return null;
  }
};

// Exportiere Hilfsfunktionen für maximale Sensor-/Pixel-Abmessungen
export { getMaxSensorDimsForModel, getMaxPixelResolutionForModel };

// Ergänze systematisch fehlende mm-Werte in sensorSizes per Pixel-Pitch
(() => {
  try {
    for (const manufacturer of Object.keys(cameraDatabase)) {
      const models = cameraDatabase[manufacturer]?.models || {};
      for (const model of Object.keys(models)) {
        const camera = models[model];
        const baseMm = getMaxSensorDimsForModel(manufacturer, model);
        const basePx = getMaxPixelResolutionForModel(manufacturer, model);
        if (!baseMm || !basePx) continue;
        const pitchW = baseMm.width / basePx.width;
        const pitchH = baseMm.height / basePx.height;
        camera.sensorSizes = camera.sensorSizes || {};
        const formats = camera.formats || Object.keys({ ...camera.pixelResolutions });
        for (const fmt of formats) {
          const existing = camera.sensorSizes[fmt];
          const hasMm = !!parseMm(existing);
          const px = parsePixels(camera.pixelResolutions?.[fmt]);
          if (!hasMm && px) {
            const w = (px.width * pitchW);
            const h = (px.height * pitchH);
            camera.sensorSizes[fmt] = `${w.toFixed(2)} x ${h.toFixed(2)} mm`;
          }
        }
      }
    }
  } catch (e) {
    console.warn('SensorSizes-Autofill Fehler:', e);
  }
})();

// Hilfsfunktionen für die Dropdown-Logik
export const getManufacturers = () => {
  return Object.keys(cameraDatabase);
};

export const getModelsByManufacturer = (manufacturer) => {
  if (!manufacturer || !cameraDatabase[manufacturer]) return [];
  return Object.keys(cameraDatabase[manufacturer].models);
};

export const getFormatsByModel = (manufacturer, model) => {
  if (!manufacturer || !model || !cameraDatabase[manufacturer]?.models[model]) return [];
  return cameraDatabase[manufacturer].models[model].formats;
};

export const getCodecsByModel = (manufacturer, model) => {
  if (!manufacturer || !model || !cameraDatabase[manufacturer]?.models[model]) return [];
  return cameraDatabase[manufacturer].models[model].codecs;
};

export const getCameraFullName = (manufacturer, model) => {
  if (!manufacturer || !model) return '';
  return `${manufacturer} ${model}`;
};

// Neue Funktion für Sensorgröße basierend auf Format
export const getSensorSizeByFormat = (manufacturer, model, format) => {
  if (!manufacturer || !model || !format || !cameraDatabase[manufacturer]?.models[model]) {
    return 'Nicht verfügbar';
  }

  const camera = cameraDatabase[manufacturer].models[model];
  const explicitMmStr = camera.sensorSizes?.[format];
  const explicitMm = parseMm(explicitMmStr);

  const baseMm = getMaxSensorDimsForModel(manufacturer, model);
  const basePx = getMaxPixelResolutionForModel(manufacturer, model);
  const px = parsePixels(camera.pixelResolutions?.[format]);

  // Wenn Pixel- und Basisdaten vorhanden sind, berechne aktive Fläche in mm aus Pitch
  if (baseMm && basePx && px) {
    const pitchW = baseMm.width / basePx.width;
    const pitchH = baseMm.height / basePx.height;
    const w = px.width * pitchW;
    const h = px.height * pitchH;
    const computedStr = `${w.toFixed(2)} x ${h.toFixed(2)} mm`;

    // Falls die Pixelauflösung dem maximalen Sensorbereich entspricht, ist es "Full Sensor"
    const pxArea = px.width * px.height;
    const basePxArea = basePx.width * basePx.height;
    const isFullSensor = basePxArea > 0 && Math.abs(pxArea - basePxArea) / basePxArea < 0.01;

    // Für kleinere Formate (Cropping/Windowing) verwende die berechnete aktive Fläche
    if (!isFullSensor) {
      return computedStr;
    }

    // Bei Full Sensor bevorzuge vorhandenen expliziten Wert, sonst berechneten
    return explicitMmStr || computedStr;
  }

  // Fallback: keine Berechnung möglich, gib expliziten Wert zurück
  if (explicitMmStr) return explicitMmStr;
  return 'Nicht verfügbar';
};

// Neue Funktion für Pixelauflösung basierend auf Format
export const getPixelResolutionByFormat = (manufacturer, model, format) => {
  if (!manufacturer || !model || !format || !cameraDatabase[manufacturer]?.models[model]) {
    return 'Nicht verfügbar';
  }
  
  const camera = cameraDatabase[manufacturer].models[model];
  if (camera.pixelResolutions && camera.pixelResolutions[format]) {
    return camera.pixelResolutions[format];
  }
  
  // Fallback für Kameras ohne spezifische Pixelauflösungs-Daten
  return 'Nicht verfügbar';
};

// Kombinierte Funktion für Kamera-Info (Pixelauflösung + Sensorgröße)
// Hilfsfunktion für berechnete Aspect Ratios (Fallback)
const calculateAspectRatio = (dimensions) => {
  if (!dimensions || dimensions === 'Nicht verfügbar') {
    return 'Nicht verfügbar';
  }
  
  // Extrahiere Breite und Höhe aus verschiedenen Formaten
  let width, height;
  
  if (dimensions.includes(' x ')) {
    // Format: "1920 x 1080" oder "36.70 x 25.54 mm"
    const parts = dimensions.replace(' mm', '').split(' x ');
    width = parseFloat(parts[0]);
    height = parseFloat(parts[1]);
  } else {
    return 'Nicht verfügbar';
  }
  
  if (isNaN(width) || isNaN(height) || height === 0) {
    return 'Nicht verfügbar';
  }
  
  const ratio = width / height;
  
  // Runde auf 2 Dezimalstellen
  return ratio.toFixed(2) + ':1';
};

// Funktion zum Abrufen vordefinierter Aspect Ratios
export const getAspectRatiosByFormat = (manufacturer, model, format) => {
  if (!manufacturer || !model || !format) {
    return { recorded: 'Nicht verfügbar', sensor: 'Nicht verfügbar' };
  }
  
  const manufacturerData = cameraDatabase[manufacturer];
  if (!manufacturerData || !manufacturerData.models) {
    return { recorded: 'Nicht verfügbar', sensor: 'Nicht verfügbar' };
  }
  
  const modelData = manufacturerData.models[model];
  if (!modelData || !modelData.aspectRatios) {
    return { recorded: 'Nicht verfügbar', sensor: 'Nicht verfügbar' };
  }
  
  const aspectRatios = modelData.aspectRatios[format];
  if (!aspectRatios) {
    return { recorded: 'Nicht verfügbar', sensor: 'Nicht verfügbar' };
  }
  
  return {
    recorded: aspectRatios.recorded || 'Nicht verfügbar',
    sensor: aspectRatios.sensor || 'Nicht verfügbar'
  };
};

// Funktion zur Berechnung der Sensordiagonale
export function calculateSensorDiagonal(sensorSize) {
  if (!sensorSize || sensorSize === 'Nicht verfügbar') {
    return 'Nicht verfügbar';
  }
  
  // Extrahiere die Breite und Höhe aus dem Sensorgrößen-String (z.B. "40.96 x 21.60 mm")
  const match = sensorSize.match(/(\d+\.\d+|\d+)\s*x\s*(\d+\.\d+|\d+)\s*mm/);
  if (!match) {
    return 'Nicht verfügbar';
  }
  
  const width = parseFloat(match[1]);
  const height = parseFloat(match[2]);
  
  // Berechne die Diagonale mit dem Satz des Pythagoras
  const diagonal = Math.sqrt(width * width + height * height);
  
  // Runde auf 2 Dezimalstellen
  return diagonal.toFixed(2);
}

// Funktion zur Formatierung der Formatanzeige mit allen Details
export function formatFormatDisplay(format, manufacturer, model) {
  if (!manufacturer || !model || !format) {
    return format || 'Nicht verfügbar';
  }
  
  try {
    // Verwende die gleiche Logik wie in getCameraInfoByFormat
    if (!cameraDatabase[manufacturer] || 
        !cameraDatabase[manufacturer].models || 
        !cameraDatabase[manufacturer].models[model]) {
      return format;
    }

    const modelData = cameraDatabase[manufacturer].models[model];
    
    // Überprüfe, ob das Format existiert
    if (!modelData.formats || !modelData.formats.includes(format)) {
      return format;
    }
    
    // Extrahiere die relevanten Informationen
    let sensorSize = 'Nicht verfügbar';
    if (modelData.sensorSizes && modelData.sensorSizes[format]) {
      sensorSize = modelData.sensorSizes[format];
    }
    
    let pixelResolution = 'Nicht verfügbar';
    if (modelData.pixelResolutions && modelData.pixelResolutions[format]) {
      pixelResolution = modelData.pixelResolutions[format];
    }
    
    // Berechne die Diagonale des Sensors
    let sensorDiagonal = 'Nicht verfügbar';
    if (sensorSize && sensorSize !== 'Nicht verfügbar') {
      const dimensions = sensorSize.split('x');
      if (dimensions.length === 2) {
        const width = parseFloat(dimensions[0].trim());
        const height = parseFloat(dimensions[1].trim());
        if (!isNaN(width) && !isNaN(height)) {
          sensorDiagonal = Math.sqrt(width * width + height * height).toFixed(2);
        }
      }
    }
    
    // Formatiere die Ausgabe als reinen Text ohne HTML-Tags
    return `${format} - ${pixelResolution} - Sensor ${sensorSize} (Diagonal: ${sensorDiagonal} mm)`;
  } catch (error) {
    console.error('Fehler bei der Formatanzeige:', error);
    return format;
  }
}

export const getCameraInfoByFormat = (manufacturer, model, format) => {
  try {
    // Überprüfe, ob die grundlegenden Daten vorhanden sind
    if (!manufacturer || !model || !format) {
      return 'Keine Informationen verfügbar';
    }
    
    if (!cameraDatabase[manufacturer] || 
        !cameraDatabase[manufacturer].models || 
        !cameraDatabase[manufacturer].models[model]) {
      return 'Keine Informationen verfügbar';
    }

    const modelData = cameraDatabase[manufacturer].models[model];
    
    // Überprüfe, ob das Format existiert
    if (!modelData.formats || !modelData.formats.includes(format)) {
      // Wenn das Format nicht gefunden wurde, versuche das erste verfügbare Format zu verwenden
      if (modelData.formats && modelData.formats.length > 0) {
        format = modelData.formats[0];
      } else {
        return 'Keine Informationen verfügbar';
      }
    }
    
    // Extrahiere die relevanten Informationen
    let sensorSize = 'Nicht verfügbar';
    if (modelData.sensorSizes && modelData.sensorSizes[format]) {
      sensorSize = modelData.sensorSizes[format];
    }
    
    let pixelResolution = 'Nicht verfügbar';
    if (modelData.pixelResolutions && modelData.pixelResolutions[format]) {
      pixelResolution = modelData.pixelResolutions[format];
    }
    
    // Berechne die Diagonale des Sensors
    let sensorDiagonal = 'Nicht verfügbar';
    if (sensorSize && sensorSize !== 'Nicht verfügbar') {
      const dimensions = sensorSize.split('x');
      if (dimensions.length === 2) {
        const width = parseFloat(dimensions[0].trim());
        const height = parseFloat(dimensions[1].trim());
        if (!isNaN(width) && !isNaN(height)) {
          sensorDiagonal = Math.sqrt(width * width + height * height).toFixed(2);
        }
      }
    }
    
    // Formatiere die Ausgabe als String im gewünschten Format mit HTML-Tags für die Formatierung
    return `<span class="format-bold">${format} 3:2</span> <span class="format-details">- ${pixelResolution} - Sensor ${sensorSize} (Diagonal: ${sensorDiagonal} mm)</span>`;
  } catch (error) {
    console.error('Fehler in getCameraInfoByFormat:', error);
    return 'Keine Informationen verfügbar';
  }
}

// Die Farbräume sind bereits in der cameraDatabase.colorSpaces definiert

// Fallback-Liste, wenn kein spezifischer Farbraum für das Modell gepflegt ist
const defaultColorSpaces = [
  "Rec. 709",
  "Rec. 2020",
  "DCI-P3",
  "sRGB",
  "Adobe RGB",
  "ACES",
  "HLG",
  "PQ"
];

// Kamera-spezifische Farbräume
export const cameraColorSpaces = {
  "ARRI": {
    "ALEXA 35": ["ARRI LogC4", "Rec. 709", "Rec. 2020", "DCI-P3", "ACES"],
    "ALEXA 35 Xtreme": ["ARRI LogC4", "Rec. 709", "Rec. 2020", "DCI-P3", "ACES"],
    "ALEXA Mini LF": ["ARRI LogC3", "Rec. 709", "Rec. 2020", "DCI-P3", "ACES"],
    "ALEXA LF": ["ARRI LogC3", "Rec. 709", "Rec. 2020", "DCI-P3", "ACES"],
    "ALEXA Mini": ["ARRI LogC3", "Rec. 709", "Rec. 2020", "DCI-P3"],
    "ALEXA SXT": ["ARRI LogC3", "Rec. 709", "Rec. 2020", "DCI-P3"],
    "AMIRA": ["ARRI LogC3", "Rec. 709", "Rec. 2020", "DCI-P3"]
  },
  "RED": {
    "V-RAPTOR": ["REDWideGamutRGB", "Rec. 709", "Rec. 2020", "DCI-P3", "ACES"],
    "V-RAPTOR 8K VV": ["REDWideGamutRGB", "Rec. 709", "Rec. 2020", "DCI-P3", "ACES"],
    "DSMC3 RED RANGER MONSTRO 8K VV": ["REDWideGamutRGB", "Rec. 709", "Rec. 2020", "DCI-P3", "ACES"],
    "KOMODO": ["REDWideGamutRGB", "Rec. 709", "Rec. 2020", "DCI-P3", "ACES"],
    "GEMINI 5K S35": ["REDWideGamutRGB", "Rec. 709", "Rec. 2020", "DCI-P3", "ACES"],
    "KOMODO-X": ["REDWideGamutRGB", "Rec. 709", "Rec. 2020", "DCI-P3", "ACES"],
    "V-RAPTOR XL 8K VV": ["REDWideGamutRGB", "Rec. 709", "Rec. 2020", "DCI-P3", "ACES"]
  },
  "Blackmagic Design": {
    "URSA Mini Pro 12K": ["Blackmagic Film Gen5", "DaVinci Wide Gamut", "Rec. 709", "Rec. 2020", "DCI-P3", "ACES"],
    "URSA Mini Pro 4.6K G2": ["Blackmagic Film Gen5", "DaVinci Wide Gamut", "Rec. 709", "Rec. 2020", "DCI-P3", "ACES"],
    "Pocket Cinema Camera 6K Pro": ["Blackmagic Film Gen5", "DaVinci Wide Gamut", "Rec. 709", "Rec. 2020", "DCI-P3"],
    "Pocket Cinema Camera 6K": ["Blackmagic Film Gen5", "DaVinci Wide Gamut", "Rec. 709", "Rec. 2020", "DCI-P3"],
    "Pocket Cinema Camera 6K G2": ["Blackmagic Film Gen5", "DaVinci Wide Gamut", "Rec. 709", "Rec. 2020", "DCI-P3"],
    "Pocket Cinema Camera 4K": ["Blackmagic Film Gen5", "DaVinci Wide Gamut", "Rec. 709", "Rec. 2020", "DCI-P3"],
    "Studio Camera 4K Plus": ["Rec. 709", "Rec. 2020", "sRGB"]
  },
  "Sony": {
    "FX9": ["S-Gamut3.Cine", "S-Gamut3", "Rec. 709", "Rec. 2020", "DCI-P3", "ACES"],
    "FX6": ["S-Gamut3.Cine", "S-Gamut3", "Rec. 709", "Rec. 2020", "DCI-P3", "ACES"],
    "FX3": ["S-Gamut3.Cine", "S-Gamut3", "Rec. 709", "Rec. 2020", "DCI-P3"],
    "A7S III": ["S-Gamut3.Cine", "S-Gamut3", "Rec. 709", "Rec. 2020", "DCI-P3"],
    "VENICE 2": ["S-Gamut3.Cine", "S-Gamut3", "Rec. 709", "Rec. 2020", "DCI-P3", "ACES"],
    "BURANO": ["S-Gamut3.Cine", "S-Gamut3", "Rec. 709", "Rec. 2020", "DCI-P3", "ACES"],
    "FX30": ["S-Gamut3.Cine", "S-Gamut3", "Rec. 709", "Rec. 2020", "DCI-P3"],
    "A1": ["S-Gamut3.Cine", "S-Gamut3", "Rec. 709", "Rec. 2020", "DCI-P3"],
    "A7 IV": ["S-Gamut3.Cine", "S-Gamut3", "Rec. 709", "Rec. 2020"],
    "A7R V": ["S-Gamut3.Cine", "S-Gamut3", "Rec. 709", "Rec. 2020"],
    "A9 III": ["S-Gamut3.Cine", "S-Gamut3", "Rec. 709", "Rec. 2020"],
    "A7 III": ["S-Gamut3.Cine", "S-Gamut3", "Rec. 709", "Rec. 2020"],
    "A7C": ["S-Gamut3.Cine", "S-Gamut3", "Rec. 709", "Rec. 2020"],
    "A7C II": ["S-Gamut3.Cine", "S-Gamut3", "Rec. 709", "Rec. 2020"],
    "A6700": ["S-Gamut3.Cine", "S-Gamut3", "Rec. 709", "Rec. 2020"],
    "ZV-E1": ["S-Gamut3.Cine", "S-Gamut3", "Rec. 709", "Rec. 2020", "DCI-P3"],
    "ZV-E10": ["S-Gamut3.Cine", "S-Gamut3", "Rec. 709", "Rec. 2020"],
    "VENICE": ["S-Gamut3.Cine", "S-Gamut3", "Rec. 709", "Rec. 2020", "DCI-P3", "ACES"],
    "FS7": ["S-Gamut3.Cine", "S-Gamut3", "Rec. 709", "Rec. 2020"],
    "FS5": ["S-Gamut3.Cine", "S-Gamut3", "Rec. 709"],
    "F55": ["S-Gamut3.Cine", "S-Gamut3", "Rec. 709", "Rec. 2020", "DCI-P3"],
    "F65": ["S-Gamut3.Cine", "S-Gamut3", "Rec. 709", "Rec. 2020", "DCI-P3", "ACES"]
  },
  "Canon": {
    "EOS C70": ["Cinema Gamut", "Rec. 709", "Rec. 2020", "DCI-P3"],
    "EOS C300 Mark III": ["Cinema Gamut", "Rec. 709", "Rec. 2020", "DCI-P3", "ACES"],
    "EOS C500 Mark II": ["Cinema Gamut", "Rec. 709", "Rec. 2020", "DCI-P3", "ACES"],
    "EOS R5 C": ["Cinema Gamut", "Rec. 709", "Rec. 2020", "DCI-P3"],
    "EOS R6 Mark II": ["Rec. 709", "Rec. 2020", "sRGB"],
    "EOS R6": ["Rec. 709", "Rec. 2020", "sRGB"],
    "EOS C300 Mark II": ["Cinema Gamut", "Rec. 709", "Rec. 2020", "DCI-P3", "ACES"],
    "EOS C200": ["Cinema Gamut", "Rec. 709", "Rec. 2020", "DCI-P3"],
    "EOS C100 Mark II": ["Rec. 709", "Rec. 2020"],
    "EOS C500": ["Cinema Gamut", "Rec. 709", "Rec. 2020", "DCI-P3", "ACES"],
    "EOS 6D": ["Rec. 709", "sRGB"],
    "EOS R5": ["Cinema Gamut", "Rec. 709", "Rec. 2020", "DCI-P3"],
    "EOS R7": ["Rec. 709", "Rec. 2020", "sRGB"],
    "EOS R3": ["Cinema Gamut", "Rec. 709", "Rec. 2020", "DCI-P3"],
    "EOS 5D Mark IV": ["Rec. 709", "sRGB"],
    "EOS-1D X Mark III": ["Cinema Gamut", "Rec. 709", "Rec. 2020", "DCI-P3", "ACES"],
    "EOS C700 FF": ["Cinema Gamut", "Rec. 709", "Rec. 2020", "DCI-P3", "ACES"]
  },
  "Panasonic": {
    "Lumix S1H": ["V-Gamut", "Rec. 709", "Rec. 2020", "DCI-P3"],
    "Lumix S5": ["V-Gamut", "Rec. 709", "Rec. 2020", "DCI-P3"],
    "Lumix S1": ["V-Gamut", "Rec. 709", "Rec. 2020", "DCI-P3"],
    "Lumix S5 II": ["V-Gamut", "Rec. 709", "Rec. 2020", "DCI-P3"],
    "Lumix S5 II X": ["V-Gamut", "Rec. 709", "Rec. 2020", "DCI-P3"],
    "Lumix GH5": ["V-Gamut", "Rec. 709", "Rec. 2020", "DCI-P3"],
    "Lumix GH5S": ["V-Gamut", "Rec. 709", "Rec. 2020", "DCI-P3"],
    "Lumix GH6": ["V-Gamut", "Rec. 709", "Rec. 2020", "DCI-P3"],
    "Lumix GH4": ["V-Gamut", "Rec. 709", "Rec. 2020", "DCI-P3"],
    "Lumix BGH1": ["V-Gamut", "Rec. 709", "Rec. 2020", "DCI-P3"],
    "AU-EVA1": ["V-Gamut", "Rec. 709", "Rec. 2020", "DCI-P3", "ACES"],
    "VariCam LT": ["V-Gamut", "Rec. 709", "Rec. 2020", "DCI-P3", "ACES"]
  },
  "Fujifilm": {
    "X-H2S": ["F-Gamut", "Rec. 709", "Rec. 2020", "DCI-P3"],
    "X-H2": ["F-Gamut", "Rec. 709", "Rec. 2020", "DCI-P3"],
    "X-T5": ["F-Gamut", "Rec. 709", "Rec. 2020", "DCI-P3"],
    "X-T4": ["F-Gamut", "Rec. 709", "Rec. 2020", "DCI-P3"],
    "X-S20": ["F-Gamut", "Rec. 709", "Rec. 2020", "DCI-P3"],
    "X-T3": ["F-Gamut", "Rec. 709", "Rec. 2020", "DCI-P3"]
  },
  "Nikon": {
    "Z6": ["N-Log", "HLG", "Rec. 709", "Rec. 2020", "DCI-P3"],
    "Z6 II": ["N-Log", "HLG", "Rec. 709", "Rec. 2020", "DCI-P3"],
    "Z7": ["N-Log", "HLG", "Rec. 709", "Rec. 2020", "DCI-P3"],
    "Z7 II": ["N-Log", "HLG", "Rec. 709", "Rec. 2020", "DCI-P3"],
    "Z9": ["N-Log", "HLG", "Rec. 709", "Rec. 2020", "DCI-P3"],
    "Z8": ["N-Log", "HLG", "Rec. 709", "Rec. 2020", "DCI-P3"]
  },
  "Z CAM": {
    "E2-M4": ["Z-Gamut", "Rec. 709", "Rec. 2020", "DCI-P3"],
    "E2-S6": ["Z-Gamut", "Rec. 709", "Rec. 2020", "DCI-P3"],
    "E2-F6": ["Z-Gamut", "Rec. 709", "Rec. 2020", "DCI-P3"],
    "E2-F8": ["Z-Gamut", "Rec. 709", "Rec. 2020", "DCI-P3"]
  },
  "GoPro": {
    "HERO12 Black": ["Rec. 709", "HLG", "Rec. 2020"],
    "HERO11 Black": ["Rec. 709", "HLG", "Rec. 2020"],
    "HERO10 Black": ["Rec. 709", "HLG", "Rec. 2020"],
    "HERO9 Black": ["Rec. 709", "HLG", "Rec. 2020"],
    "HERO8 Black": ["Rec. 709"],
    "HERO7 Black": ["Rec. 709"],
    "MAX": ["Rec. 709"],
    "Fusion": ["Rec. 709"]
  },
  "DJI": {
    "Osmo Action 4": ["D-Cinelike", "Rec. 709", "HLG"],
    "Osmo Action 3": ["D-Cinelike", "Rec. 709", "HLG"],
    "Osmo Pocket 3": ["D-Cinelike", "Rec. 709", "HLG"],
    "Osmo Pocket 2": ["D-Cinelike", "Rec. 709"],
    "Osmo Action 2": ["D-Cinelike", "Rec. 709"],
    "Osmo Action": ["D-Cinelike", "Rec. 709"],
    "Osmo Pocket": ["D-Cinelike", "Rec. 709"],
    "Mavic 3": ["D-Log", "HLG", "Rec. 709"],
    "Mavic 3 Classic": ["D-Log", "HLG", "Rec. 709"],
    "Mavic 3 Pro": ["D-Log M", "HLG", "Rec. 709"],
    "Air 3": ["D-Log M", "HLG", "Rec. 709"],
    "Mini 4 Pro": ["D-Log M", "HLG", "Rec. 709"],
    "Avata 2": ["D-Log M", "HLG", "Rec. 709"],
    "Inspire 3": ["D-Log", "HLG", "Rec. 709"]
  },
  "Insta360": {
    "X3": ["Rec. 709", "HLG"],
    "One X2": ["Rec. 709", "HLG"],
    "X4": ["Rec. 709", "HLG"],
    "X5": ["Rec. 709", "HLG"],
    "One RS 1-Inch 360": ["Rec. 709", "HLG"],
    "GO 3": ["Rec. 709"],
    "GO 2": ["Rec. 709"],
    "One X": ["Rec. 709", "HLG"],
    "One R 360": ["Rec. 709", "HLG"],
    "One RS 4K": ["Rec. 709", "HLG"],
    "Pro 2": ["Rec. 709", "HLG"],
    "Titan": ["Rec. 709", "HLG"]
  },
  "Ricoh Theta": {
    "THETA Z1": ["Rec. 709"],
    "THETA X": ["Rec. 709"],
    "THETA V": ["Rec. 709"],
    "THETA SC2": ["Rec. 709"],
    "THETA S": ["Rec. 709"],
    "THETA SC": ["Rec. 709"]
  },
  "WEISSCAM": {
    "HS-2": ["Rec. 709", "Rec. 2020", "DCI-P3", "ACES"],
    "HS-1": ["Rec. 709", "DCI-P3", "ACES"]
  }
};

export const getColorSpacesByModel = (manufacturer, model) => {
  if (!manufacturer || !model) return [];
  const byBrand = cameraColorSpaces[manufacturer];
  if (!byBrand) return defaultColorSpaces;
  const byModel = byBrand[model];
  return byModel && byModel.length ? byModel : defaultColorSpaces;
};

// Codec-abhängige Framerates (vereinfachtes Regelwerk)
const baseFramerates = [
  "23.98 fps",
  "24 fps",
  "25 fps",
  "29.97 fps",
  "30 fps",
];
const highFramerates = [
  "50 fps",
  "59.94 fps",
  "60 fps",
];

// Bestimme Framerate-Sets pro Codec-Name
const codecFramerateRules = {
  // RAW-Codecs – breite Unterstützung inkl. High-FPS
  "ARRI RAW": [...baseFramerates, ...highFramerates],
  "REDCODE RAW": [...baseFramerates, ...highFramerates],
  "RED RAW (.R3D)": [...baseFramerates, ...highFramerates],
  "Blackmagic RAW": [...baseFramerates, ...highFramerates],
  "Z-RAW": [...baseFramerates, ...highFramerates],
  "N-RAW": [...baseFramerates, ...highFramerates],
  "X-OCN": [...baseFramerates, ...highFramerates],
  "WEISSCAM RAW": [...baseFramerates, ...highFramerates],

  // ProRes – konservativ: XQ/4444 ohne High-FPS, 422/422 HQ mit High-FPS
  "ProRes 4444 XQ": [...baseFramerates],
  "ProRes 4444": [...baseFramerates],
  "ProRes 422 HQ": [...baseFramerates, ...highFramerates],
  "ProRes 422": [...baseFramerates, ...highFramerates],

  // DNx – häufig bis 60p
  "DNxHD": [...baseFramerates, ...highFramerates],
  "DNxHR": [...baseFramerates, ...highFramerates],
  "DPX/TIFF": [...baseFramerates, ...highFramerates],

  // Long-GOP/MP4 – häufig bis 60p
  "H.265": [...baseFramerates, ...highFramerates],
  "H.264": [...baseFramerates, ...highFramerates],
  "XAVC": [...baseFramerates, ...highFramerates],
  "XAVC S": [...baseFramerates, ...highFramerates],
  "XAVC S-I": [...baseFramerates, ...highFramerates],
  "XAVC HS": [...baseFramerates, ...highFramerates],
  "XF-AVC": [...baseFramerates, ...highFramerates],
  "MP4": [...baseFramerates, ...highFramerates],
  "MOV": [...baseFramerates, ...highFramerates],
  "HD-SDI (YCbCr 4:2:2)": [...baseFramerates, ...highFramerates],
};

// Liefert zulässige Framerates für Hersteller/Modell/Codec.
// Hinweis: Dies ist ein vereinfachtes Modell – bei Bedarf kameramodellspezifisch erweitern.
export const getFrameratesByCodec = (manufacturer, model, codec) => {
  if (!codec) return [];
  const normalized = String(codec).trim();

  // Modell-spezifische Erweiterung: ALEXA 35 Xtreme
  if (
    String(manufacturer).trim() === 'ARRI' &&
    String(model).trim() === 'ALEXA 35 Xtreme'
  ) {
    const xtremeBase = [
      ...baseFramerates,
      ...highFramerates,
      "75 fps",
      "120 fps",
      "150 fps",
      "165 fps",
      "190 fps",
      "240 fps",
      "330 fps",
    ];
    const xtremeOverdrive = [...xtremeBase, "660 fps"];
    // ARRICORE nutzt volle Bandbreite inkl. Overdrive-Option
    if (normalized.includes('ARRICORE')) return xtremeOverdrive;
    // Für andere Codecs am Xtreme: bis zu 330 fps
    return xtremeBase;
  }

  // Modell-spezifische Erweiterung: WEISSCAM HS-2 / HS-1
  if (String(manufacturer).trim() === 'WEISSCAM') {
    const modelName = String(model).trim();
    // HS-2: Hohe HFR-Fähigkeiten abhängig vom Output
    if (modelName === 'HS-2') {
      const hs2Extended = [
        ...baseFramerates,
        ...highFramerates,
        "75 fps",
        "120 fps",
        "150 fps",
        "240 fps",
        "500 fps",
        "1000 fps",
        "1500 fps",
        "2000 fps",
        "4000 fps",
      ];
      if (normalized.includes('WEISSCAM RAW')) return hs2Extended;
      if (normalized.includes('HD-SDI')) return [...baseFramerates, ...highFramerates];
      return hs2Extended;
    }
    // HS-1: RAW/DPX/TIFF mit HFR bis ca. 1150 fps, HD-SDI bis 60p
    if (modelName === 'HS-1') {
      const hs1RawExtended = [
        ...baseFramerates,
        ...highFramerates,
        "650 fps",
        "950 fps",
        "1150 fps",
      ];
      if (normalized.includes('DPX') || normalized.includes('TIFF')) return hs1RawExtended;
      if (normalized.includes('HD-SDI')) return [...baseFramerates, ...highFramerates];
      return hs1RawExtended;
    }
  }

  // Modell-spezifische Erweiterung: RED KOMODO-X und V-RAPTOR XL
  if (String(manufacturer).trim() === 'RED') {
    const modelName = String(model).trim();
    if (modelName === 'KOMODO-X' || modelName === 'V-RAPTOR XL 8K VV') {
      const redExtended = [
        ...baseFramerates,
        ...highFramerates,
        "75 fps",
        "120 fps",
      ];
      return redExtended;
    }

    // Erweiterte HFR für weitere RED-Modelle: V-RAPTOR und V-RAPTOR 8K VV
    if (modelName === 'V-RAPTOR' || modelName === 'V-RAPTOR 8K VV' || modelName === 'DSMC3 RED RANGER MONSTRO 8K VV') {
      const redExtended = [
        ...baseFramerates,
        ...highFramerates,
        "75 fps",
        "120 fps",
      ];
      // RED RAW und ProRes 422-Varianten unterstützen typischerweise höhere FPS
      if (
        normalized.includes('RED RAW') ||
        normalized.includes('REDCODE') ||
        normalized.includes('ProRes 422')
      ) {
        return redExtended;
      }
      // Sonst generische Codec-Regel anwenden
    }
  }

  // Modell-spezifische Erweiterung: Kinefinity MAVO Edge 6K/8K
  if (String(manufacturer).trim() === 'Kinefinity') {
    const modelName = String(model).trim();
    if (modelName === 'MAVO Edge 6K' || modelName === 'MAVO Edge 8K') {
      const kineExtended = [
        ...baseFramerates,
        ...highFramerates,
        "75 fps",
        "120 fps",
      ];
      // Höhere FPS bei CinemaDNG und ProRes 422-Varianten
      if (
        normalized.includes('CinemaDNG') ||
        normalized.includes('ProRes 422')
      ) {
        return kineExtended;
      }
      // Für 4444/4444 XQ konservativ bleiben
    }
  }

  // Modell-spezifische Erweiterung: Z CAM E2-F8 (und nahe Varianten)
  if (String(manufacturer).trim() === 'Z CAM') {
    const modelName = String(model).trim();
    if (modelName === 'E2-F8' || modelName === 'E2-F6' || modelName === 'E2-S6') {
      const zcamExtended = [
        ...baseFramerates,
        ...highFramerates,
        "75 fps",
        "120 fps",
      ];
      if (
        normalized.includes('Z-RAW') ||
        normalized.includes('ProRes 422') ||
        normalized.includes('H.265') ||
        normalized.includes('H.264')
      ) {
        return zcamExtended;
      }
    }
  }

  // Hersteller-weite HFR-Erweiterungen: Sony
  if (String(manufacturer).trim() === 'Sony') {
    const sonyExtended = [
      ...baseFramerates,
      ...highFramerates,
      "75 fps",
      "120 fps",
    ];
    if (
      normalized.includes('XAVC') ||
      normalized.includes('ProRes 422') ||
      normalized.includes('H.265') ||
      normalized.includes('H.264')
    ) {
      return sonyExtended;
    }
  }

  // Hersteller-weite HFR-Erweiterungen: Canon
  if (String(manufacturer).trim() === 'Canon') {
    const canonExtended = [
      ...baseFramerates,
      ...highFramerates,
      "75 fps",
      "120 fps",
    ];
    if (
      normalized.includes('Cinema RAW Light') ||
      normalized.includes('XF-AVC') ||
      normalized.includes('ProRes 422') ||
      normalized.includes('H.265') ||
      normalized.includes('H.264') ||
      normalized.includes('MP4')
    ) {
      return canonExtended;
    }
  }

  // Hersteller-weite HFR-Erweiterungen: Panasonic
  if (String(manufacturer).trim() === 'Panasonic') {
    const panaExtended = [
      ...baseFramerates,
      ...highFramerates,
      "75 fps",
      "120 fps",
    ];
    if (
      normalized.includes('ProRes 422') ||
      normalized.includes('MOV') ||
      normalized.includes('MP4')
    ) {
      return panaExtended;
    }
  }

  // Hersteller-weite HFR-Erweiterungen: Fujifilm
  if (String(manufacturer).trim() === 'Fujifilm') {
    const fujiExtended = [
      ...baseFramerates,
      ...highFramerates,
      "75 fps",
      "120 fps",
    ];
    if (
      normalized.includes('ProRes 422') ||
      normalized.includes('H.265') ||
      normalized.includes('H.264')
    ) {
      return fujiExtended;
    }
  }

  // Hersteller-weite HFR-Erweiterungen: Nikon
  if (String(manufacturer).trim() === 'Nikon') {
    const nikonExtended = [
      ...baseFramerates,
      ...highFramerates,
      "75 fps",
      "120 fps",
    ];
    if (
      normalized.includes('ProRes 422') ||
      normalized.includes('H.265') ||
      normalized.includes('H.264')
    ) {
      return nikonExtended;
    }
  }

  // Generische Regeln anhand des Codec-Namens
  if (codecFramerateRules[normalized]) return codecFramerateRules[normalized];
  const entry = Object.entries(codecFramerateRules).find(([key]) => normalized.includes(key));
  if (entry) return entry[1];
  return [...baseFramerates, ...highFramerates];
};

// Flicker‑Safe Richtwerte (Netzfrequenz 50/60 Hz)
// t = (ShutterAngle/360) · (1/FPS)
export const flickerSafeGuidelines = {
  '50Hz': {
    '24fps': { shutterAngle: 172.8, exposureTime: '1/50 s' },
    '25fps': { shutterAngle: 180, exposureTime: '1/50 s' },
    '50fps': { shutterAngle: 180, exposureTime: '1/100 s' },
  },
  '60Hz': {
    '24fps': { shutterAngle: 144, exposureTime: '1/60 s' },
    '30fps': { shutterAngle: 180, exposureTime: '1/60 s' },
    '60fps': { shutterAngle: 180, exposureTime: '1/120 s' },
  }
};

// LogC/EI Hinweise (vereinfachte, praxisnahe Zusammenfassung)
export const logCExposureInfo = {
  'ARRI': {
    LogC3: {
      middleGraySignal: '≈ 39% (18% Grau)',
      note: 'Klassische ALEXA‑Modelle (z. B. Mini/LF) nutzen LogC3.'
    },
    LogC4: {
      middleGraySignal: 'mittelpunkt abweichend zu LogC3 (ALEXA 35)',
      note: 'ALEXA 35 nutzt LogC4; Hersteller‑LUTs/Handbuch für genaue Platzierung verwenden.'
    }
  }
};

export const eiBehaviorNotes = {
  'ARRI': 'EI verschiebt die Signalplatzierung (Highlight/Schatten‑Priorisierung) und das Verstärkungs‑/Rauschverhalten; die physische Belichtung am Sensor bleibt konstant.'
};