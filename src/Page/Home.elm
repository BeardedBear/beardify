module Page.Home exposing (Model, Msg(..), init, update, view)

import Data.Session exposing (Session)
import Html exposing (..)
import Html.Attributes exposing (..)
import Views.Device as Device
import Views.Player as Player
import Views.Sidebar as Sidebar
import Views.Topbar as Topbar


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
    , [ Topbar.view
      , div [ class "App__body" ]
            [ Sidebar.view
            , div [ class "Content" ]
                [ div [ class "Page" ]
                    [ h1 [] [ text "Ceci est une page d'accueil du plus bel effet." ]
                    , p [] [ text "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum eget convallis justo, eget sodales eros. Curabitur massa lacus, convallis non metus pretium, iaculis venenatis tellus. Morbi faucibus scelerisque ex, non ullamcorper lorem semper non. Nunc sapien turpis, finibus ac egestas eget, aliquam at magna. Cras bibendum sit amet elit sed ornare. Maecenas et neque scelerisque, interdum dui eu, tincidunt augue. Pellentesque vitae tincidunt nisl, id maximus massa. Cras tempor, orci at gravida aliquam, nunc elit porta augue, a varius arcu odio vitae risus. Curabitur eget leo tristique, laoreet libero et, posuere justo. Phasellus non consectetur dolor. Suspendisse ac auctor nisi. Donec rhoncus neque at tortor euismod, at semper nunc bibendum. Nulla in efficitur lacus, sit amet interdum felis. Donec id est vehicula odio feugiat suscipit quis congue quam. Donec eu purus tristique, tincidunt quam vitae, lobortis lacus." ]
                    ]
                , div [ class "BottomBar" ]
                    [ Player.view
                    , Device.view
                    ]
                ]
            ]
      ]
    )
