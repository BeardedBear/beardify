module Data.Artist exposing
    ( Artist
    , ArtistSimplified
    , decode
    , decodeSimplified
    )

import Data.Image as Image exposing (Image)
import Json.Decode as Decode exposing (Decoder)


type alias Artist =
    { id : String
    , name : String
    , popularity : Int
    , type_ : String
    }


decode : Decoder Artist
decode =
    Decode.map4 Artist
        (Decode.field "id" Decode.string)
        (Decode.field "name" Decode.string)
        (Decode.field "popularity" Decode.int)
        (Decode.field "type" Decode.string)


type alias ArtistSimplified =
    { id : String
    , name : String
    }


decodeSimplified : Decoder ArtistSimplified
decodeSimplified =
    Decode.map2 ArtistSimplified
        (Decode.field "id" Decode.string)
        (Decode.field "name" Decode.string)
