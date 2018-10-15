module Artist exposing (Artist, Artists, ListArtist, decodeArtist, decodeArtists, decodeListArtist, getArtist, getArtistAlbums)

import Http exposing (..)
import Image exposing (..)
import Json.Decode as Decode exposing (..)
import Json.Encode as Encode
import Token exposing (..)


type alias Artist =
    { id : String
    , images : List Image
    , name : String
    , popularity : Int
    , type_ : String
    }


type alias Artists =
    { id : String
    , name : String
    }


type alias ListArtist =
    { items : List Artist }


decodeArtist : Decode.Decoder Artist
decodeArtist =
    Decode.map5 Artist
        (Decode.field "id" Decode.string)
        (Decode.at [ "images" ] (Decode.list decodeImage))
        (Decode.field "name" Decode.string)
        (Decode.field "popularity" Decode.int)
        (Decode.field "type" Decode.string)


decodeArtists : Decode.Decoder Artists
decodeArtists =
    Decode.map2 Artists
        (Decode.field "id" Decode.string)
        (Decode.field "name" Decode.string)


decodeListArtist : Decode.Decoder ListArtist
decodeListArtist =
    Decode.map ListArtist
        (Decode.at [ "artists", "items" ] (Decode.list decodeArtist))


getArtist : String -> Decode.Decoder a -> Token -> Request a
getArtist id decoder token =
    request
        { method = "GET"
        , headers =
            [ Http.header "Authorization" <| "Bearer " ++ token.token
            ]
        , url = "https://api.spotify.com/v1/artists/" ++ id
        , body = Http.emptyBody
        , expect = Http.expectJson decoder
        , timeout = Nothing
        , withCredentials = False
        }


getArtistAlbums : String -> Decode.Decoder a -> Token -> Request a
getArtistAlbums id decoder token =
    request
        { method = "GET"
        , headers =
            [ Http.header "Authorization" <| "Bearer " ++ token.token
            ]
        , url = "https://api.spotify.com/v1/artists/" ++ id ++ "/albums" ++ "?market=FR&album_type=album"
        , body = Http.emptyBody
        , expect = Http.expectJson decoder
        , timeout = Nothing
        , withCredentials = False
        }
