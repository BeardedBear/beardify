module Data.Device exposing
    ( Device
    , decodeDevice
    , init
    )

import Json.Decode as Decode exposing (..)


type alias Device =
    { id : String
    , name : String
    , volume_percent : Int
    }


init : Device
init =
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
