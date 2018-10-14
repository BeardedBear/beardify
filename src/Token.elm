module Token exposing (Token, decodeToken)

import Json.Decode as Decode exposing (..)


type alias Token =
    { token : String
    }


decodeToken : Decode.Decoder Token
decodeToken =
    Decode.map Token
        (Decode.field "token" Decode.string)
