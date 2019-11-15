module Views.Device exposing (Model, Msg(..), default, init, update, view)

import Data.Device as Device exposing (Device)
import Data.Session exposing (Session)
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Http
import Request.Device as Request
import Task


type alias Model =
    { devices : List Device
    , lastDevice : Maybe Device
    }


type Msg
    = Activate Device
    | Activated (Result ( Session, Http.Error ) ())
    | DeviceList (Result ( Session, Http.Error ) (List Device))
    | UpdateVolume String
    | SetVolume (Result ( Session, Http.Error ) ())


default : Model
default =
    { devices = []
    , lastDevice = Nothing
    }


init : Session -> ( Model, Cmd Msg )
init session =
    ( default
    , Cmd.batch
        [ Task.attempt DeviceList (Request.getList session) ]
    )


initVolume : List Device -> Int
initVolume =
    List.filter .active
        >> List.head
        >> Maybe.map .volume
        >> Maybe.withDefault 0


update : Session -> Msg -> Model -> ( Model, Session, Cmd Msg )
update session msg model =
    case msg of
        DeviceList (Ok devices) ->
            ( { model | devices = devices }
            , session
            , Cmd.none
            )

        DeviceList (Err ( newSession, _ )) ->
            ( model, newSession, Cmd.none )

        Activate device ->
            let
                inactive device_ =
                    { device_ | active = False }

                active =
                    \d ->
                        if d.id == device.id then
                            { d | active = True }

                        else
                            d

                lastActiveDevice =
                    List.filter .active model.devices
                        |> List.head

                updateDevices =
                    List.map inactive >> List.map active
            in
            ( { model
                | devices = updateDevices model.devices
                , lastDevice = lastActiveDevice
              }
            , session
            , Task.attempt Activated (Request.set session device)
            )

        Activated (Ok _) ->
            ( model, session, Cmd.none )

        Activated (Err ( newSession, _ )) ->
            ( model, newSession, Cmd.none )

        UpdateVolume volume ->
            let
                activeDevice =
                    List.filter .active model.devices
                        |> List.head

                newDevice =
                    List.map
                        (\d ->
                            case activeDevice of
                                Just device ->
                                    if d.id == device.id then
                                        { d | volume = String.toInt volume |> Maybe.withDefault 0 }

                                    else
                                        d

                                Nothing ->
                                    d
                        )
                        model.devices
            in
            ( { model | devices = newDevice }
            , session
            , case activeDevice of
                Just _ ->
                    Task.attempt SetVolume (Request.setVolume session (String.toInt volume |> Maybe.withDefault 0))

                Nothing ->
                    Cmd.none
            )

        SetVolume (Ok _) ->
            ( model, session, Cmd.none )

        SetVolume (Err ( newSession, _ )) ->
            ( model, newSession, Cmd.none )


head : Html msg
head =
    div [ class "DeviceListHead" ]
        [ div []
            [ i [ class "DeviceListHead__icon1 icon-smartphone" ] []
            , i [ class "DeviceListHead__icon2 icon-computer" ] []
            , i [ class "DeviceListHead__icon3 icon-speaker" ] []
            ]
        , div [ class "DeviceListHead__desc" ]
            [ text "Choose the device on which to play your music"
            ]
        ]


item : Device -> Html Msg
item ({ name, type_, active } as device) =
    div
        [ classList
            [ ( "DeviceList__item", True )
            , ( "active", active )
            ]
        , onClick (Activate device)
        ]
        [ div [ class "DeviceList__icon" ] [ i [ class ("icon-" ++ Device.typeToString type_) ] [] ]
        , div [ class "Device__name" ] [ text name ]
        ]


view : Model -> Html Msg
view model =
    div [ class "Device" ]
        [ div [ class "Device__select" ]
            [ i [ class "Device__active icon-computer" ] []
            , List.map item model.devices
                |> (::) head
                |> div [ class "DeviceList" ]
            ]
        , div [ class "DeviceVolume" ]
            [ i [ class "DeviceVolume__icon icon-sound" ] []
            , input
                [ class "Range"
                , type_ "range"
                , Html.Attributes.min "0"
                , Html.Attributes.max "100"
                , step "1"
                , onInput UpdateVolume
                , value (String.fromInt (initVolume model.devices))
                ]
                []
            ]
        ]
