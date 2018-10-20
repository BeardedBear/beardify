module Search exposing (Model, init, search)

import Album exposing (..)
import Artist exposing (..)
import Http exposing (..)
import Json.Decode as Decode exposing (..)
import Track exposing (..)


type alias Model =
    { findArtist : List Artist
    , findAlbum : List Album
    , findTrack : List Track
    , searchQuery : String
    }


init =
    { findArtist = []
    , findAlbum = []
    , findTrack = []
    , searchQuery = ""
    }


search : String -> String -> Int -> Decode.Decoder a -> String -> Request a
search query type_ limit decoder token =
    request
        { method = "GET"
        , headers =
            [ Http.header "Authorization" <| "Bearer " ++ token
            ]
        , url = "https://api.spotify.com/v1/search?q=" ++ query ++ "&type=" ++ type_ ++ "&limit=" ++ String.fromInt limit
        , body = Http.emptyBody
        , expect = Http.expectJson decoder
        , timeout = Nothing
        , withCredentials = False
        }
