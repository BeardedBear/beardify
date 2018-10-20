module Player exposing (Model, decodePlayer, getPlayer, init, postControls, putSeekPosition)

import Device exposing (..)
import Http exposing (..)
import Json.Decode as Decode exposing (..)
import Track exposing (..)


type alias Model =
    { device : Device
    , is_playing : Bool
    , progress_ms : Int
    , item : Track
    , repeat_state : String
    , shuffle_state : Bool
    }


init =
    { device =
        { id = ""
        , name = ""
        , volume_percent = 0
        }
    , is_playing = False
    , progress_ms = 0
    , item =
        { name = ""
        , duration_ms = 0
        , artists = []
        , album =
            { album_type = ""
            , artists = []
            , id = " "
            , images = []
            , name = ""
            , release_date = ""
            , type_ = ""
            , uri = ""
            }
        , uri = ""
        }
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


getPlayer : Decode.Decoder a -> String -> Request a
getPlayer decoder token =
    request
        { method = "GET"
        , headers =
            [ Http.header "Authorization" <| "Bearer " ++ token
            ]
        , url = "https://api.spotify.com/v1/me/player"
        , body = Http.emptyBody
        , expect = Http.expectJson decoder
        , timeout = Nothing
        , withCredentials = False
        }


postControls : String -> String -> String -> Request ()
postControls method control token =
    request
        { method = method
        , headers =
            [ Http.header "Authorization" <| "Bearer " ++ token
            ]
        , url = "https://api.spotify.com/v1/me/player/" ++ control
        , body = Http.emptyBody
        , expect = Http.expectStringResponse (\_ -> Ok ())
        , timeout = Nothing
        , withCredentials = False
        }


putSeekPosition : String -> String -> Request ()
putSeekPosition duration token =
    request
        { method = "PUT"
        , headers =
            [ Http.header "Authorization" <| "Bearer " ++ token
            ]
        , url = "https://api.spotify.com/v1/me/player/seek?position_ms=" ++ duration
        , body = Http.emptyBody
        , expect = Http.expectStringResponse (\_ -> Ok ())
        , timeout = Nothing
        , withCredentials = False
        }
