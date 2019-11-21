module Data.Artist exposing
    ( Artist
    , ArtistSimplified
    , Id
    , decode
    , decodeSimplified
    , idToString
    , parseId
    )

import Data.Image as Image exposing (Image)
import Json.Decode as Decode exposing (Decoder)
import Url.Parser as Parser exposing (Parser)


type alias Artist =
    { id : Id
    , name : String
    , images : List Image
    , popularity : Int
    , type_ : String
    }


type alias ArtistSimplified =
    { id : Id
    , name : String
    }


type Id
    = Id String


decode : Decoder Artist
decode =
    Decode.map5 Artist
        (Decode.field "id" decodeId)
        (Decode.field "name" Decode.string)
        (Decode.field "images" (Decode.list Image.decode))
        (Decode.field "popularity" Decode.int)
        (Decode.field "type" Decode.string)


decodeId : Decoder Id
decodeId =
    Decode.map Id Decode.string


decodeSimplified : Decoder ArtistSimplified
decodeSimplified =
    Decode.map2 ArtistSimplified
        (Decode.field "id" decodeId)
        (Decode.field "name" Decode.string)


idToString : Id -> String
idToString (Id id) =
    id


parseId : Parser (Id -> a) a
parseId =
    Parser.map Id Parser.string
