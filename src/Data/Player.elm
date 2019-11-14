module Data.Player exposing (Player, decode)

import Data.Device as Device exposing (Device)
import Data.Track as Track exposing (Track)
import Json.Decode as Decode exposing (Decoder)


type alias Context =
    { uri : String
    , href : String
    , externalUrls : ExternalUrl
    , type_ : String
    }


type alias ExternalUrl =
    { spotify : String }


type Id
    = Id String


type alias Player =
    { device : Device
    , repeatState : String
    , context : Context
    , shuffle : Bool
    , timestamp : Int
    , track : Track
    , progress : Int
    , currentPlayingType : String
    }


decode : Decoder Player
decode =
    Decode.map8 Player
        (Decode.field "device" Device.decode)
        (Decode.field "repeat_state" Decode.string)
        (Decode.field "context" decodeContext)
        (Decode.field "shuffle_state" Decode.bool)
        (Decode.field "timestamp" Decode.int)
        (Decode.field "item" Track.decode)
        (Decode.field "progress_ms" Decode.int)
        (Decode.field "currently_playing_type" Decode.string)


decodeContext : Decoder Context
decodeContext =
    Decode.map4 Context
        (Decode.field "uri" Decode.string)
        (Decode.field "href" Decode.string)
        (Decode.field "external_urls"
            (Decode.map ExternalUrl
                (Decode.field "spotify" Decode.string)
            )
        )
        (Decode.field "type" Decode.string)
