module Data.Artist exposing
    ( Artist
    , ArtistSimplified
    , Id
    , decode
    , decodeSimplified
    , idToString
    , parseId
    )

import Json.Decode as Decode exposing (Decoder)
import Url.Parser as Parser exposing (Parser)


type alias Artist =
    { id : Id
    , name : String
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
    Decode.map4 Artist
        (Decode.field "id" decodeId)
        (Decode.field "name" Decode.string)
        (Decode.field "popularity" Decode.int)
        (Decode.field "type" Decode.string)


decodeId : Decoder Id
decodeId =
    Decode.string
        |> Decode.map Id


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
