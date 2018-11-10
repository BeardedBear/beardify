module Data.Artist exposing (Artist, Artists, ListArtist, decodeArtist, decodeArtistTopTracks, decodeArtists, decodeListArtist)

import Data.Image exposing (..)
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
