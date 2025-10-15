import { useState } from 'react';

export const cameraDatabase = {
  "ARRI": {
    models: {
      "ALEXA 35": {
        formats: ["4.6K", "UHD", "2K", "HD"],
        codecs: ["ARRI RAW", "ProRes 4444 XQ", "ProRes 4444", "ProRes 422 HQ", "ProRes 422"],
        sensorSizes: {
          "4.6K": "36.70 x 25.54 mm",
          "UHD": "36.70 x 20.63 mm",
          "2K": "23.76 x 13.37 mm",
          "HD": "23.76 x 13.37 mm"
        },
        pixelResolutions: {
          "4.6K": "4608 x 3164",
          "UHD": "3840 x 2160",
          "2K": "2048 x 1152",
          "HD": "1920 x 1080"
        },
        aspectRatios: {
          "4.6K": {
            recorded: "3:2",
            sensor: "3:2"
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
      "ALEXA Mini LF": {
        formats: ["4.5K", "UHD", "2K", "HD"],
        codecs: ["ARRI RAW", "ProRes 4444 XQ", "ProRes 4444", "ProRes 422 HQ", "ProRes 422"],
        sensorSizes: {
          "4.5K": "36.70 x 25.54 mm",
          "UHD": "36.70 x 20.63 mm",
          "2K": "23.76 x 13.37 mm", 
          "HD": "23.76 x 13.37 mm"
        },
        pixelResolutions: {
          "4.5K": "4448 x 3096",
          "UHD": "3840 x 2160",
          "2K": "2048 x 1152",
          "HD": "1920 x 1080"
        },
        aspectRatios: {
          "4.5K": {
            recorded: "3:2",
            sensor: "3:2"
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
      "ALEXA LF": {
        formats: ["4.5K", "UHD", "2K", "HD"],
        codecs: ["ARRI RAW", "ProRes 4444 XQ", "ProRes 4444", "ProRes 422 HQ", "ProRes 422"],
        sensorSizes: {
          "4.5K": "36.70 x 25.54 mm",
          "UHD": "36.70 x 20.63 mm",
          "2K": "23.76 x 13.37 mm",
          "HD": "23.76 x 13.37 mm"
        },
        pixelResolutions: {
          "4.5K": "4448 x 3096",
          "UHD": "3840 x 2160",
          "2K": "2048 x 1152",
          "HD": "1920 x 1080"
        },
        aspectRatios: {
          "4.5K": {
            recorded: "3:2",
            sensor: "3:2"
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
      }
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
      }
    }
  }
};

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
  if (camera.sensorSizes && camera.sensorSizes[format]) {
    return camera.sensorSizes[format];
  }
  
  // Fallback für Kameras ohne spezifische Sensorgrößen-Daten
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
    "GEMINI 5K S35": ["REDWideGamutRGB", "Rec. 709", "Rec. 2020", "DCI-P3", "ACES"]
  },
  "Blackmagic Design": {
    "URSA Mini Pro 12K": ["Blackmagic Design", "Rec. 709", "Rec. 2020", "DCI-P3", "ACES"],
    "URSA Mini Pro 4.6K G2": ["Blackmagic Design", "Rec. 709", "Rec. 2020", "DCI-P3", "ACES"],
    "Pocket Cinema Camera 6K Pro": ["Blackmagic Design", "Rec. 709", "Rec. 2020", "DCI-P3"],
    "Pocket Cinema Camera 4K": ["Blackmagic Design", "Rec. 709", "Rec. 2020", "DCI-P3"],
    "Studio Camera 4K Plus": ["Rec. 709", "Rec. 2020", "sRGB"]
  },
  "Sony": {
    "FX9": ["S-Gamut3.Cine", "S-Gamut3", "Rec. 709", "Rec. 2020", "DCI-P3", "ACES"],
    "FX6": ["S-Gamut3.Cine", "S-Gamut3", "Rec. 709", "Rec. 2020", "DCI-P3", "ACES"],
    "FX3": ["S-Gamut3.Cine", "S-Gamut3", "Rec. 709", "Rec. 2020", "DCI-P3"],
    "A7S III": ["S-Gamut3.Cine", "S-Gamut3", "Rec. 709", "Rec. 2020", "DCI-P3"],
    "VENICE 2": ["S-Gamut3.Cine", "S-Gamut3", "Rec. 709", "Rec. 2020", "DCI-P3", "ACES"],
    "BURANO": ["S-Gamut3.Cine", "S-Gamut3", "Rec. 709", "Rec. 2020", "DCI-P3", "ACES"]
  },
  "Canon": {
    "EOS C70": ["Cinema Gamut", "Rec. 709", "Rec. 2020", "DCI-P3"],
    "EOS C300 Mark III": ["Cinema Gamut", "Rec. 709", "Rec. 2020", "DCI-P3", "ACES"],
    "EOS C500 Mark II": ["Cinema Gamut", "Rec. 709", "Rec. 2020", "DCI-P3", "ACES"],
    "EOS R5 C": ["Cinema Gamut", "Rec. 709", "Rec. 2020", "DCI-P3"],
    "EOS R6 Mark II": ["Rec. 709", "Rec. 2020", "sRGB"]
  },
  "Panasonic": {
    "Lumix S1H": ["V-Gamut", "Rec. 709", "Rec. 2020", "DCI-P3"],
    "Lumix GH6": ["V-Gamut", "Rec. 709", "Rec. 2020", "DCI-P3"],
    "AU-EVA1": ["V-Gamut", "Rec. 709", "Rec. 2020", "DCI-P3", "ACES"],
    "VariCam LT": ["V-Gamut", "Rec. 709", "Rec. 2020", "DCI-P3", "ACES"]
  },
  "Fujifilm": {
    "X-H2S": ["F-Gamut", "Rec. 709", "Rec. 2020", "DCI-P3"],
    "X-H2": ["F-Gamut", "Rec. 709", "Rec. 2020", "DCI-P3"],
    "X-T5": ["F-Gamut", "Rec. 709", "Rec. 2020", "DCI-P3"]
  },
  "Z CAM": {
    "E2-M4": ["Rec. 709", "Rec. 2020", "DCI-P3"],
    "E2-S6": ["Rec. 709", "Rec. 2020", "DCI-P3"],
    "E2-F6": ["Rec. 709", "Rec. 2020", "DCI-P3"]
  }
};

export const getColorSpacesByModel = (manufacturer, model) => {
  if (!manufacturer || !model) return [];
  const byBrand = cameraColorSpaces[manufacturer];
  if (!byBrand) return defaultColorSpaces;
  const byModel = byBrand[model];
  return byModel && byModel.length ? byModel : defaultColorSpaces;
};