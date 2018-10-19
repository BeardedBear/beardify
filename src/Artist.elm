module Artist exposing (Artist, Artists, ListArtist, RelatedArtists, decodeArtist, decodeArtistTopTracks, decodeArtists, decodeListArtist, decodeRelatedArtists, getArtist, getArtistAlbums, getRelatedArtists)

import Http exposing (..)
import Image exposing (..)
import Json.Decode as Decode exposing (..)
import Json.Encode as Encode


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


type alias RelatedArtists =
    { artists : List Artist }


decodeRelatedArtists : Decode.Decoder RelatedArtists
decodeRelatedArtists =
    Decode.map RelatedArtists
        (Decode.at [ "artists" ] (Decode.list decodeArtist))


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


decodeArtistTopTracks : Decode.Decoder ListArtist
decodeArtistTopTracks =
    Decode.map ListArtist
        (Decode.at [ "artists", "items" ] (Decode.list decodeArtist))


getArtist : String -> Decode.Decoder a -> String -> Request a
getArtist id decoder token =
    request
        { method = "GET"
        , headers =
            [ Http.header "Authorization" <| "Bearer " ++ token
            ]
        , url = "https://api.spotify.com/v1/artists/" ++ id
        , body = Http.emptyBody
        , expect = Http.expectJson decoder
        , timeout = Nothing
        , withCredentials = False
        }


getRelatedArtists : String -> String -> Request RelatedArtists
getRelatedArtists id token =
    request
        { method = "GET"
        , headers =
            [ Http.header "Authorization" <| "Bearer " ++ token
            ]
        , url = "https://api.spotify.com/v1/artists/" ++ id ++ "/related-artists"
        , body = Http.emptyBody
        , expect = Http.expectJson decodeRelatedArtists
        , timeout = Nothing
        , withCredentials = False
        }


getArtistAlbums : String -> Decode.Decoder a -> String -> Request a
getArtistAlbums id decoder token =
    request
        { method = "GET"
        , headers =
            [ Http.header "Authorization" <| "Bearer " ++ token
            ]
        , url = "https://api.spotify.com/v1/artists/" ++ id ++ "/albums" ++ "?market=FR&album_type=album"
        , body = Http.emptyBody
        , expect = Http.expectJson decoder
        , timeout = Nothing
        , withCredentials = False
        }
