module Page.Home exposing (Model, Msg(..), init, update, view)

import Data.Session exposing (Session)
import Html exposing (..)
import Html.Attributes exposing (class, type_)


type alias Model =
    String


type Msg
    = NoOp


init : Session -> ( Model, Session, Cmd Msg )
init session =
    ( ""
    , session
    , Cmd.none
    )


update : Session -> Msg -> Model -> ( Model, Session, Cmd Msg )
update session msg model =
    case msg of
        NoOp ->
            ( model
            , session
            , Cmd.none
            )


view : Session -> Model -> ( String, List (Html Msg) )
view _ _ =
    ( "Home"
    , [ div [ class "Topbar" ]
            [ div [ class "Sidebar__logo" ] [ text "LOGO" ]
            , div [ class "Search" ]
                [ input [ class "Search__input", type_ "text" ] []
                ]
            , div [ class "User" ] [ text "Qui que je suis ?" ]
            ]
      , div [ class "App__body" ]
            [ div [ class "Sidebar" ]
                [ div [ class "Sidebar__collections" ]
                    [ text "collections" ]
                , div [ class "Sidebar__playlists" ]
                    [ text "playlists" ]
                ]
            , div [ class "Content" ]
                [ div [ class "Page" ] [ text "page" ]
                , div [ class "Player" ] [ text "player" ]
                ]
            ]
      ]
    )
