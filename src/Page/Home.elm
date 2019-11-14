module Page.Home exposing (Model, Msg(..), init, update, view)

import Data.Device as Device
import Data.Session as Session exposing (Session)
import Html exposing (..)
import Html.Attributes exposing (..)
import Views.Artist as Artist
import Views.Device as Device
import Views.Player as Player
import Views.Sidebar as Sidebar
import Views.Topbar as Topbar


type alias Model =
    { device : Device.Model }


type Msg
    = DeviceMsg Device.Msg


init : Session -> ( Model, Session, Cmd Msg )
init session =
    let
        ( deviceModel, deviceCmd ) =
            Device.init session
    in
    ( { device = deviceModel }
    , session
    , Cmd.batch [ Cmd.map DeviceMsg deviceCmd ]
    )


update : Session -> Msg -> Model -> ( Model, Session, Cmd Msg )
update session msg model =
    case msg of
        DeviceMsg deviceMsg ->
            let
                ( deviceModel, newSession, deviceCmd ) =
                    Device.update session deviceMsg model.device
            in
            ( { model | device = deviceModel }
            , newSession
            , Cmd.batch [ Cmd.map DeviceMsg deviceCmd ]
            )


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
                    [ Player.view
                    , Device.view model.device
                        |> Html.map DeviceMsg
                    ]
                ]
            ]
      ]
    )
