module Page.Home exposing (Model, Msg(..), init, subscriptions, update, view)

import Data.Device as Device
import Data.Session exposing (Session)
import Html exposing (..)
import Html.Attributes exposing (..)
import Request.Player as RequestPlayer
import Task
import Views.Device as Device
import Views.Player as Player
import Views.Sidebar as Sidebar
import Views.Topbar as Topbar


type alias Model =
    { device : Device.Model
    , player : Player.Model
    }


type Msg
    = DeviceMsg Device.Msg
    | PlayerMsg Player.Msg


init : Session -> ( Model, Session, Cmd Msg )
init session =
    let
        ( deviceModel, deviceCmd ) =
            Device.init session

        ( playerModel, playerCmd ) =
            Player.init session
    in
    ( { device = deviceModel, player = playerModel }
    , session
    , Cmd.batch
        [ Cmd.map DeviceMsg deviceCmd
        , Cmd.map PlayerMsg playerCmd
        ]
    )


update : Session -> Msg -> Model -> ( Model, Session, Cmd Msg )
update session msg model =
    case msg of
        DeviceMsg deviceMsg ->
            let
                ( deviceModel, newSession, deviceCmd ) =
                    Device.update session deviceMsg model.device

                player =
                    model.player
            in
            case deviceMsg of
                Device.Activated (Ok _) ->
                    ( { model | player = { player | refreshTick = 1000 } }
                    , newSession
                    , Cmd.batch
                        [ Cmd.map DeviceMsg deviceCmd ]
                    )

                _ ->
                    ( { model | device = deviceModel }
                    , newSession
                    , Cmd.batch
                        [ Cmd.map DeviceMsg deviceCmd ]
                    )

        PlayerMsg playerMsg ->
            let
                ( playerModel, newSession, playerCmd ) =
                    Player.update session playerMsg model.player
            in
            ( { model | player = playerModel }
            , newSession
            , Cmd.batch [ Cmd.map PlayerMsg playerCmd ]
            )


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.batch
        [ Player.subscriptions model.player
            |> Sub.map PlayerMsg
        ]


view : Session -> Model -> ( String, List (Html Msg) )
view session model =
    ( "Home"
    , [ Topbar.view session
      , div [ class "App__body" ]
            [ Sidebar.view
            , div [ class "Content" ]
                [ div [ class "Page HelperScrollArea" ]
                    [ div [ class "Page__body HelperScrollArea__target" ]
                        [ h1 [ class "Heading first" ] [ text "Ceci est une page d'accueil du plus bel effet." ]
                        , p [] [ text "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum eget convallis justo, eget sodales eros. Curabitur massa lacus, convallis non metus pretium, iaculis venenatis tellus. Morbi faucibus scelerisque ex, non ullamcorper lorem semper non. Nunc sapien turpis, finibus ac egestas eget, aliquam at magna. Cras bibendum sit amet elit sed ornare. Maecenas et neque scelerisque, interdum dui eu, tincidunt augue. Pellentesque vitae tincidunt nisl, id maximus massa. Cras tempor, orci at gravida aliquam, nunc elit porta augue, a varius arcu odio vitae risus. Curabitur eget leo tristique, laoreet libero et, posuere justo. Phasellus non consectetur dolor. Suspendisse ac auctor nisi. Donec rhoncus neque at tortor euismod, at semper nunc bibendum. Nulla in efficitur lacus, sit amet interdum felis. Donec id est vehicula odio feugiat suscipit quis congue quam. Donec eu purus tristique, tincidunt quam vitae, lobortis lacus." ]
                        ]
                    ]
                , div [ class "Content__bottom" ]
                    [ Player.view model.player
                        |> Html.map PlayerMsg
                    , Device.view model.device
                        |> Html.map DeviceMsg
                    ]
                ]
            ]
      ]
    )
