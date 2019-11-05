module Page.Counter exposing (Model, Msg, init, update, view)

import Data.Session as Session exposing (Session)
import Html exposing (..)
import Html.Events exposing (onClick)
import Ports
import Route


type alias Model =
    Int


type Msg
    = Dec
    | Inc
    | Reset


init : Session -> ( Model, Session, Cmd Msg )
init session =
    ( session.store.counter, session, Cmd.none )


update : Session -> Msg -> Model -> ( Model, Session, Cmd Msg )
update ({ store } as session) msg model =
    case msg of
        Dec ->
            ( model - 1
            , { session | store = { store | counter = model - 1 } }
            , Cmd.none
            )

        Inc ->
            ( model + 1
            , { session | store = { store | counter = model + 1 } }
            , Cmd.none
            )

        Reset ->
            ( 0
            , { session | store = { store | counter = 0 } }
            , Cmd.none
            )


view : Session -> Model -> ( String, List (Html Msg) )
view _ model =
    ( "Second Page"
    , [ h1 [] [ text "Second page" ]
      , p [] [ text "This is the second page, featuring a counter." ]
      , p []
            [ button [ onClick Dec ] [ text "-" ]
            , strong [] [ text (String.fromInt model) ]
            , button [ onClick Inc ] [ text "+" ]
            , button [ onClick Reset ] [ text "reset" ]
            ]
      , p [] [ a [ Route.href Route.Home ] [ text "Back home" ] ]
      ]
    )
