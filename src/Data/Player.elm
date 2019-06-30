module Data.Player exposing (PlayerModel, decodePlayer, playerInit)

import Data.Device exposing (Device, deviceInit)
import Data.Track exposing (Track, trackInit)
import Json.Decode as Decode exposing (Decoder(..), at, field)


playerInit : PlayerModel
playerInit =
    { device = deviceInit
    , is_playing = False
    , progress_ms = 0
    , item = trackInit
    , repeat_state = ""
    , shuffle_state = False
    }


type alias PlayerModel =
    { device : Device
    , is_playing : Bool
    , progress_ms : Int
    , item : Track
    , repeat_state : String
    , shuffle_state : Bool
    }


decodePlayer : Decode.Decoder PlayerModel
decodePlayer =
    Decode.map6 PlayerModel
        (Decode.at [ "device" ] Data.Device.decodeDevice)
        (Decode.field "is_playing" Decode.bool)
        (Decode.field "progress_ms" Decode.int)
        (Decode.at [ "item" ] Data.Track.decodeTrack)
        (Decode.field "repeat_state" Decode.string)
        (Decode.field "shuffle_state" Decode.bool)
