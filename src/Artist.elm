module Artist exposing (Artist, ListArtist, decodeArtist, decodeListArtist)

import Http exposing (..)
import Json.Decode as Decode exposing (..)
import Json.Encode as Encode


type alias ArtistImage =
    { url : String
    }


type alias Artist =
    { id : String
    , name : String
    , type_ : String
    }


type alias ListArtist =
    { items : List Artist }



-- Artists


decodeArtist : Decode.Decoder Artist
decodeArtist =
    Decode.map3 Artist
        (Decode.field "id" Decode.string)
        (Decode.field "name" Decode.string)
        (Decode.field "type" Decode.string)


decodeArtistImage : Decode.Decoder ArtistImage
decodeArtistImage =
    Decode.map ArtistImage
        (Decode.field "url" Decode.string)


decodeListArtist : Decode.Decoder ListArtist
decodeListArtist =
    Decode.map ListArtist
        (Decode.at [ "artists", "items" ] (Decode.list decodeArtist))
