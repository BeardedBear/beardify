module Page.Login exposing (Model, Msg, init, update, view)

import Browser.Navigation as Nav
import Data.Authentication as Authentication
import Data.Session as Session exposing (Session)
import Data.Spotify as Spotify
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)


type alias Model =
    {}


type Msg
    = Submit


init : Session -> ( Model, Session, Cmd Msg )
init session =
    ( {}, session, Cmd.none )


update : Session -> Msg -> Model -> ( Model, Session, Cmd Msg )
update session msg model =
    case msg of
        Submit ->
            ( model
            , Session.updateState session.randomBytes session
            , Cmd.batch
                [ Authentication.createAuthentication session.clientId session.clientUrl "" Spotify.scope session.randomBytes
                    |> Authentication.params
                    |> String.append session.authUrl
                    |> Nav.load
                ]
            )


view : Session -> Model -> ( String, List (Html Msg) )
view _ _ =
    ( "Login"
    , [ div [ class "Page Login" ]
            [ div [ class "Login__form" ]
                [ div []
                    [ img [ src "./img/logo.png" ] []
                    , span [] [ text "beardify" ]
                    ]
                , button [ onClick Submit ] [ text "Sign in" ]
                ]
            ]
      ]
    )
