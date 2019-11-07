module Data.Authentication exposing
    ( Authentication
    , Nonce
    , ResponseType(..)
    , createAuthentication
    , createNonce
    , decodeNonce
    , defaultNonce
    , encodeNonce
    , generateNonce
    , nonceToString
    , params
    , randomNonce
    )

-- https://openid.net/specs/openid-connect-core-1_0.html#ImplicitFlowAuth

import Json.Decode as Decode exposing (Decoder)
import Json.Encode as Encode
import Random as Random
import Random.Char as RandomChar
import Random.String as RandomString
import Url.Builder as Builder


type alias Authentication =
    { clientId : ClientId
    , responseType : List ResponseType
    , redirectUri : String
    , scope : List String
    , state : String
    , nonce : Nonce
    }


type ClientId
    = ClientId String


type ResponseType
    = Code
    | IdToken
    | Token


type Nonce
    = Nonce String


defaultNonce : Nonce
defaultNonce =
    Nonce ""


clientIdToString : ClientId -> String
clientIdToString (ClientId id) =
    id


createNonce : String -> Nonce
createNonce string =
    Nonce string


createAuthentication : String -> String -> String -> List String -> Authentication
createAuthentication id url_ nonce scope =
    { clientId = ClientId id
    , responseType = [ IdToken, Token ]
    , redirectUri = url_
    , scope = scope
    , state = ""
    , nonce = Nonce nonce
    }


params : Authentication -> String
params auth =
    Builder.relative [ "authorize" ]
        [ Builder.string "client_id" (clientIdToString auth.clientId)
        , Builder.string "redirect_uri" auth.redirectUri
        , Builder.string "response_type"
            (List.map responseTypeToString auth.responseType
                |> String.join " "
            )
        , String.join " " auth.scope
            |> Builder.string "scope"
        , Builder.string "nonce" (nonceToString auth.nonce)
        ]


decodeNonce : Decoder Nonce
decodeNonce =
    Decode.string
        |> Decode.andThen (Decode.succeed << Nonce)


encodeNonce : Nonce -> Encode.Value
encodeNonce (Nonce nonce) =
    Encode.string nonce


generateNonce : (String -> msg) -> Cmd msg
generateNonce func =
    Random.generate func randomNonce


randomNonce : Random.Generator String
randomNonce =
    RandomString.string 16 RandomChar.latin


nonceToString : Nonce -> String
nonceToString (Nonce str) =
    str


responseTypeToString : ResponseType -> String
responseTypeToString type_ =
    case type_ of
        Code ->
            "code"

        IdToken ->
            "id_token"

        Token ->
            "token"
