module Page.Home exposing (Msg(..), init, update, view)

import Data.Session
import Html exposing (Html, div, text)
import Html.Attributes exposing (class)
import Http


type Msg
    = ReadmeReceived (Result Http.Error String)


init : Data.Session.Session -> ( String, Cmd Msg )
init _ =
    ( "Retrieving README from github"
    , Cmd.none
    )


update : Data.Session.Session -> Msg -> String -> ( String, Cmd Msg )
update _ msg model =
    case msg of
        ReadmeReceived (Ok _) ->
            ( model
            , Cmd.none
            )

        ReadmeReceived (Err _) ->
            ( model
            , Cmd.none
            )


view : Data.Session.Session -> String -> ( String, List (Html Msg) )
view _ _ =
    ( "Home"
    , [ div [ class "Page__content" ] [ text "" ]
      ]
    )
