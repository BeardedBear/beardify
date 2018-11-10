module Data.Player exposing (Model, decodePlayer, init)

import Data.Device as Device exposing (..)
import Data.Track as Track exposing (..)
import Http exposing (..)
import Json.Decode as Decode exposing (..)


type alias Model =
    { device : Device
    , is_playing : Bool
    , progress_ms : Int
    , item : Track
    , repeat_state : String
    , shuffle_state : Bool
    }


init : Model
init =
    { device = Device.init
    , is_playing = False
    , progress_ms = 0
    , item = Track.init
    , repeat_state = ""
    , shuffle_state = False
    }


decodePlayer : Decode.Decoder Model
decodePlayer =
    Decode.map6 Model
        (Decode.at [ "device" ] decodeDevice)
        (Decode.field "is_playing" Decode.bool)
        (Decode.field "progress_ms" Decode.int)
        (Decode.at [ "item" ] decodeTrack)
        (Decode.field "repeat_state" Decode.string)
        (Decode.field "shuffle_state" Decode.bool)
