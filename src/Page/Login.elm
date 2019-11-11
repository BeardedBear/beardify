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
                    [ img [ class "Login__logo", src "./img/logo.svg" ] []
                    ]
                , p [ class "Login__desc" ]
                    [ text "Have you ever imagined"
                    , b [] [ text " Spotify " ]
                    , text "with a rocket launcher? 🔫"
                    ]
                , button [ class "Button spotify", onClick Submit ]
                    [ i [ class "Button__icon spotify icon-spotify" ] []
                    , text "Connect with Spotify"
                    ]
                ]
            ]
      , div [ class "Login__foot" ]
            [ div []
                [ text "Crafted by "
                , a [ class "Link", href "https://github.com/BeardedBear" ] [ text "BeardedBear" ]
                , text " and "
                , a [ class "Link", href "https://github.com/fbentz" ] [ text "fbentz" ]
                ]
            , div []
                [ text "Participate in the open source project : "
                , a [ class "Link", href "https://github.com/BeardedBear/beardify" ] [ text "Github" ]
                ]
            ]
      ]
    )
