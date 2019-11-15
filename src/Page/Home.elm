module Page.Home exposing (Model, Msg(..), init, subscriptions, update, view)

import Data.Device as Device
import Data.Session exposing (Session)
import Html exposing (..)
import Html.Attributes exposing (..)
import Views.Artist as Artist
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
                [ div [ class "Page" ]
                    [ Artist.view
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
