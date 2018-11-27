module Page.Home exposing (Model, Msg(..), init, update, view)

import Data.Session exposing (Session)
import Html.Styled as Html exposing (..)
import Http


type alias Model =
    { readme : String
    }


type Msg
    = ReadmeReceived (Result Http.Error String)


init : Session -> ( Model, Cmd Msg )
init session =
    ( { readme = "Retrieving README from github" }
    , Cmd.none
    )


update : Session -> Msg -> Model -> ( Model, Cmd Msg )
update _ msg model =
    case msg of
        ReadmeReceived (Ok readme) ->
            ( model
            , Cmd.none
            )

        ReadmeReceived (Err error) ->
            ( model
            , Cmd.none
            )


view : Session -> Model -> ( String, List (Html Msg) )
view session model =
    ( "Home"
    , [ div [] [ text <| Debug.toString session.search ]
      ]
    )
