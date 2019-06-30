module Data.Device exposing
    ( Device
    , decodeDevice
    , deviceInit
    )

import Json.Decode as Decode exposing (Decoder(..), field)


type alias Device =
    { id : String
    , name : String
    , volume_percent : Int
    }


deviceInit : Device
deviceInit =
    { id = ""
    , name = ""
    , volume_percent = 0
    }


decodeDevice : Decode.Decoder Device
decodeDevice =
    Decode.map3 Device
        (Decode.field "id" Decode.string)
        (Decode.field "name" Decode.string)
        (Decode.field "volume_percent" Decode.int)
