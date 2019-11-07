module Data.Authorization exposing
    ( Authorization
    , Error
    , authorizationErrorToString
    , createAuthHeader
    , decode
    , encode
    , endSession
    , parseAuthRoute
    , tokenIdToString
    )

-- https://openid.net/specs/openid-connect-core-1_0.html#ImplicitAuthResponse

import Browser.Navigation as Nav
import Json.Decode as Decode exposing (Decoder)
import Json.Encode as Encode
import Url exposing (Url)
import Url.Builder as Builder exposing (..)
import Url.Parser as Parser exposing (Parser)
import Url.Parser.Query as Query


type alias Authorization =
    { accessToken : AccessToken
    , idToken : IdToken
    , tokenType : TokenType
    , expires : Int
    , state : String
    }


type AccessToken
    = AccessToken String


type alias Error =
    { code : AuthorizationError
    , description : Maybe String
    }


type AuthorizationError
    = DecodeError
    | Oauth2Error Oauth2ErrorCode
    | OpenIdError OpenIdErrorCode
    | MissingError


type Oauth2ErrorCode
    = AccessDenied
    | InvalidRequest
    | InvalidScope
    | ServerError
    | TemporarilyUnavailable
    | UnsupportedResponseType
    | UnauthorizedClient


type OpenIdErrorCode
    = AccountSelectionRequired
    | InteractionRequired
    | ConsentRequired
    | InvalidRequestUri
    | InvalidRequestObject
    | LoginRequired
    | RequestNotSupported
    | RequestUriNotSupported
    | RegistrationNotSupported


type IdToken
    = IdToken String


type TokenType
    = Bearer
    | Invalid


accessTokenToString : AccessToken -> String
accessTokenToString (AccessToken token) =
    token


authorizationErrorToString : AuthorizationError -> String
authorizationErrorToString authorizationError =
    case authorizationError of
        OpenIdError openIdError ->
            "OpenId error: " ++ openIdErrorCodeToString openIdError

        Oauth2Error oauth2Error ->
            "oAuth2 error: " ++ oauth2ErrorCodeToString oauth2Error

        DecodeError ->
            "Decode error: Unable to decode parameters"

        MissingError ->
            "Missing error: Missing parameters"


decode : Decoder Authorization
decode =
    Decode.map5 Authorization
        (Decode.field "access_token" (Decode.map AccessToken Decode.string))
        (Decode.field "id_token" (Decode.map IdToken Decode.string))
        (Decode.field "token_type" (Decode.map tokenTypeFromString Decode.string))
        (Decode.field "expires_in" Decode.int)
        (Decode.field "state" Decode.string)


decodeAuthorizationError : String -> AuthorizationError
decodeAuthorizationError string =
    case string of
        "access_denied" ->
            Oauth2Error AccessDenied

        "account_selection_required" ->
            OpenIdError AccountSelectionRequired

        "consent_required" ->
            OpenIdError ConsentRequired

        "interaction_required" ->
            OpenIdError InteractionRequired

        "invalid_request" ->
            Oauth2Error InvalidRequest

        "invalid_request_uri" ->
            OpenIdError InvalidRequestUri

        "invalid_request_object" ->
            OpenIdError InvalidRequestObject

        "invalid_scope" ->
            Oauth2Error InvalidScope

        "login_required" ->
            OpenIdError LoginRequired

        "registration_not_supported" ->
            OpenIdError RegistrationNotSupported

        "request_not_supported" ->
            OpenIdError RequestNotSupported

        "request_uri_not_supported" ->
            OpenIdError RequestUriNotSupported

        "server_error" ->
            Oauth2Error ServerError

        "temporarily_unavailable" ->
            Oauth2Error TemporarilyUnavailable

        "unauthorized_client" ->
            Oauth2Error UnauthorizedClient

        "unsupported_response_type" ->
            Oauth2Error UnsupportedResponseType

        _ ->
            DecodeError


encode : Authorization -> Encode.Value
encode v =
    Encode.object
        [ ( "access_token", v.accessToken |> accessTokenToString |> Encode.string )
        , ( "id_token", v.idToken |> tokenIdToString |> Encode.string )
        , ( "token_type", v.tokenType |> tokenTypeToString |> Encode.string )
        , ( "expires_in", Encode.int v.expires )
        , ( "state", Encode.string v.state )
        ]


createAuthHeader : Authorization -> Maybe String
createAuthHeader { accessToken, tokenType } =
    -- FIXME: this is really something which should live in an Http dedicated module
    case tokenType of
        Bearer ->
            Just ("Bearer " ++ accessTokenToString accessToken)

        Invalid ->
            Nothing


oauth2ErrorCodeToString : Oauth2ErrorCode -> String
oauth2ErrorCodeToString oauth2Error =
    case oauth2Error of
        AccessDenied ->
            "Access denied"

        InvalidRequest ->
            "Invalid request"

        InvalidScope ->
            "Invalid scope"

        ServerError ->
            "Server error"

        TemporarilyUnavailable ->
            "Temporarily unavailable"

        UnauthorizedClient ->
            "Unauthorized client"

        UnsupportedResponseType ->
            "Unsupported response type"


openIdErrorCodeToString : OpenIdErrorCode -> String
openIdErrorCodeToString openIdError =
    case openIdError of
        AccountSelectionRequired ->
            "Account selection required"

        ConsentRequired ->
            "Consent required"

        InteractionRequired ->
            "Interaction Required"

        InvalidRequestUri ->
            "Invalid request uri"

        InvalidRequestObject ->
            "Invalid request object"

        LoginRequired ->
            "Login required"

        RegistrationNotSupported ->
            "Registration not supported"

        RequestNotSupported ->
            "Request not supported"

        RequestUriNotSupported ->
            "Request uri not supported"


parseAuthFragment : Maybe String -> Maybe (Result Error Authorization)
parseAuthFragment =
    -- Note: the fragment actually contains query string parameters as per specification
    Maybe.map (\str -> Url Url.Http "" Nothing "" (Just str) (Just ""))
        >> Maybe.andThen (Parser.parse (Parser.query parseAuthQuery))


parseAuthQuery : Query.Parser (Result Error Authorization)
parseAuthQuery =
    Query.map7 toParsedAuthorization
        (Query.map
            (Maybe.map AccessToken)
            (Query.string "access_token")
        )
        (Query.map
            (Maybe.map IdToken)
            (Query.string "id_token")
        )
        (Query.map
            (Maybe.map tokenTypeFromString >> Maybe.withDefault Invalid)
            (Query.string "token_type")
        )
        (Query.map
            (Maybe.withDefault 0)
            (Query.int "expires_in")
        )
        (Query.map
            (Maybe.withDefault "")
            (Query.string "state")
        )
        (Query.string "error")
        (Query.string "error_description")


parseAuthRoute : (Result Error Authorization -> a) -> a -> Parser (a -> a) a
parseAuthRoute authRoute fallbackRoute =
    Parser.fragment parseAuthFragment
        |> Parser.map (Maybe.map authRoute >> Maybe.withDefault fallbackRoute)


endSession : String -> String -> Authorization -> Cmd msg
endSession authUrl redirectUrl auth =
    Builder.relative [ "end-session" ]
        [ Builder.string "id_token_hint" (tokenIdToString auth.idToken)
        , Builder.string "post_logout_redirect_uri" redirectUrl
        , Builder.string "state" auth.state
        ]
        |> (++) authUrl
        |> Nav.load


tokenTypeFromString : String -> TokenType
tokenTypeFromString string =
    case string of
        "bearer" ->
            Bearer

        _ ->
            Invalid


tokenIdToString : IdToken -> String
tokenIdToString (IdToken id) =
    id


toParsedAuthorization :
    Maybe AccessToken
    -> Maybe IdToken
    -> TokenType
    -> Int
    -> String
    -> Maybe String
    -> Maybe String
    -> Result Error Authorization
toParsedAuthorization access tokenId type_ expires state errorCode description =
    case ( access, tokenId, errorCode ) of
        ( _, _, Just errorCode_ ) ->
            Err
                { code = decodeAuthorizationError errorCode_
                , description = description
                }

        ( Nothing, _, Nothing ) ->
            Err
                { code = MissingError
                , description = Just "access_token param is missing."
                }

        ( _, Nothing, Nothing ) ->
            Err
                { code = MissingError
                , description = Just "token_id param is missing."
                }

        ( Just access_, Just tokenId_, Nothing ) ->
            Ok (Authorization access_ tokenId_ type_ expires state)


tokenTypeToString : TokenType -> String
tokenTypeToString type_ =
    case type_ of
        Bearer ->
            "Bearer"

        Invalid ->
            "invalid"
