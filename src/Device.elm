module Device exposing (Device, decodeDevice)

import Json.Decode as Decode exposing (..)


type alias Device =
    { id : String
    , name : String
    , volume_percent : Int
    }


decodeDevice : Decode.Decoder Device
decodeDevice =
    Decode.map3 Device
        (Decode.field "id" Decode.string)
        (Decode.field "name" Decode.string)
        (Decode.field "volume_percent" Decode.int)
