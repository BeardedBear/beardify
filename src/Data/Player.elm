module Data.Player exposing (Model, decodePlayer, init)

import Data.Device
import Data.Track
import Json.Decode as Decode exposing (Decoder(..), at, field)


init : Model
init =
    { device = Data.Device.init
    , is_playing = False
    , progress_ms = 0
    , item = Data.Track.init
    , repeat_state = ""
    , shuffle_state = False
    }


type alias Model =
    { device : Data.Device.Device
    , is_playing : Bool
    , progress_ms : Int
    , item : Data.Track.Track
    , repeat_state : String
    , shuffle_state : Bool
    }


decodePlayer : Decode.Decoder Model
decodePlayer =
    Decode.map6 Model
        (Decode.at [ "device" ] Data.Device.decodeDevice)
        (Decode.field "is_playing" Decode.bool)
        (Decode.field "progress_ms" Decode.int)
        (Decode.at [ "item" ] Data.Track.decodeTrack)
        (Decode.field "repeat_state" Decode.string)
        (Decode.field "shuffle_state" Decode.bool)
