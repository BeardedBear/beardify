module Artist exposing (Artist, ListArtist, decodeArtist, decodeListArtist)

import Http exposing (..)
import Json.Decode as Decode exposing (..)
import Json.Encode as Encode


type alias Artist =
    { name : String
    , type_ : String
    }


type alias ListArtist =
    { items : List Artist }



-- Artists


decodeArtist : Decode.Decoder Artist
decodeArtist =
    Decode.map2 Artist
        (Decode.field "name" Decode.string)
        (Decode.field "type" Decode.string)


decodeListArtist : Decode.Decoder ListArtist
decodeListArtist =
    Decode.map ListArtist
        (Decode.at [ "artists", "items" ] (Decode.list decodeArtist))
