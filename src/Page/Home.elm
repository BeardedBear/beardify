module Page.Home exposing (Model, Msg(..), init, subscriptions, update, view)

import Data.Session exposing (Session)
import Html exposing (..)
import Html.Attributes exposing (..)
import Page.Artist as Artist


type alias Model =
    {}


type Msg
    = NoOp


init : Session -> ( Model, Session, Cmd Msg )
init session =
    ( {}
    , session
    , Cmd.none
    )


update : Session -> Msg -> Model -> ( Model, Session, Cmd Msg )
update session msg model =
    case msg of
        NoOp ->
            ( model, session, Cmd.none )


subscriptions : Model -> Sub Msg
subscriptions _ =
    Sub.none


view : Session -> Model -> ( String, List (Html Msg) )
view _ _ =
    ( "Home"
    , [ div [ class "Page__body HelperScrollArea__target" ]
            [ Artist.view
            ]
      ]
    )
