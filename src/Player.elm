module Player exposing (Player, decodePlayer, getPlayer, postControls, putSeekPosition)

import Device exposing (..)
import Http exposing (..)
import Json.Decode as Decode exposing (..)
import Token exposing (..)
import Track exposing (..)


type alias Player =
    { device : Device
    , is_playing : Bool
    , progress_ms : Int
    , item : Track
    , repeat_state : String
    , shuffle_state : Bool
    }


decodePlayer : Decode.Decoder Player
decodePlayer =
    Decode.map6 Player
        (Decode.at [ "device" ] decodeDevice)
        (Decode.field "is_playing" Decode.bool)
        (Decode.field "progress_ms" Decode.int)
        (Decode.at [ "item" ] decodeTrack)
        (Decode.field "repeat_state" Decode.string)
        (Decode.field "shuffle_state" Decode.bool)


getPlayer : Decode.Decoder a -> Token -> Request a
getPlayer decoder token =
    request
        { method = "GET"
        , headers =
            [ Http.header "Authorization" <| "Bearer " ++ token.token
            ]
        , url = "https://api.spotify.com/v1/me/player"
        , body = Http.emptyBody
        , expect = Http.expectJson decoder
        , timeout = Nothing
        , withCredentials = False
        }


postControls : String -> String -> Token -> Request ()
postControls method control token =
    request
        { method = method
        , headers =
            [ Http.header "Authorization" <| "Bearer " ++ token.token
            ]
        , url = "https://api.spotify.com/v1/me/player/" ++ control
        , body = Http.emptyBody
        , expect = Http.expectStringResponse (\_ -> Ok ())
        , timeout = Nothing
        , withCredentials = False
        }


putSeekPosition : String -> Token -> Request ()
putSeekPosition duration token =
    request
        { method = "PUT"
        , headers =
            [ Http.header "Authorization" <| "Bearer " ++ token.token
            ]
        , url = "https://api.spotify.com/v1/me/player/seek?position_ms=" ++ duration
        , body = Http.emptyBody
        , expect = Http.expectStringResponse (\_ -> Ok ())
        , timeout = Nothing
        , withCredentials = False
        }
