module Data.Player exposing (Player, decode)

import Data.Device as Device exposing (Device)
import Data.Track as Track exposing (Track)
import Json.Decode as Decode exposing (Decoder)
import Json.Decode.Pipeline as JDP


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
    , playing : Bool
    , currentPlayingType : String
    }


decode : Decoder Player
decode =
    Decode.succeed Player
        |> JDP.required "device" Device.decode
        |> JDP.required "repeat_state" Decode.string
        |> JDP.required "context" decodeContext
        |> JDP.required "shuffle_state" Decode.bool
        |> JDP.required "timestamp" Decode.int
        |> JDP.required "item" Track.decode
        |> JDP.required "progress_ms" Decode.int
        |> JDP.required "is_playing" Decode.bool
        |> JDP.required "currently_playing_type" Decode.string


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
