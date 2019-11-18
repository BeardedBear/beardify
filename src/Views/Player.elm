module Views.Player exposing
    ( Msg(..)
    , init
    , subscriptions
    , update
    , view
    )

import Data.Artist exposing (ArtistSimplified)
import Data.Image as Image
import Data.Player as Player exposing (Player, PlayerContext)
import Data.Session exposing (Session)
import Data.Track as Track
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (..)
import Http
import Request.Player as Request
import Route
import Task
import Time exposing (Posix)


type Msg
    = Next
    | Pause
    | Paused (Result ( Session, Http.Error ) ())
    | Play
    | Played (Result ( Session, Http.Error ) ())
    | Prev
    | Refresh Posix
    | Refreshed (Result ( Session, Http.Error ) Player)
    | Seek String
    | Seeked (Result ( Session, Http.Error ) ())
    | SkipTrack (Result ( Session, Http.Error ) ())


artistsView : List ArtistSimplified -> List (Html msg)
artistsView =
    let
        item artist =
            a [ Route.Artist artist.id |> Route.href, class "Artist__link" ] [ text artist.name ]
    in
    List.map item >> List.intersperse (span [] [ text ", " ])


init : Session -> ( PlayerContext, Cmd Msg )
init session =
    ( Player.defaultPlayerContext
    , Task.attempt Refreshed (Request.get session)
    )


update : Session -> Msg -> PlayerContext -> ( PlayerContext, Session, Cmd Msg )
update session msg model =
    case msg of
        Next ->
            ( model, session, Task.attempt SkipTrack (Request.next session) )

        Pause ->
            let
                newPlayer =
                    Maybe.map (\player -> { player | playing = False })
            in
            ( { model
                | player = newPlayer model.player
                , refreshTick = Player.defaultTick
              }
            , session
            , Task.attempt Paused (Request.pause session)
            )

        Paused (Ok _) ->
            ( model, session, Cmd.none )

        Paused (Err ( newSession, _ )) ->
            ( model, newSession, Cmd.none )

        Play ->
            let
                newPlayer =
                    Maybe.map (\player -> { player | playing = True })
            in
            ( { model
                | player = newPlayer model.player
                , refreshTick = 1000
              }
            , session
            , Task.attempt Played (Request.play session)
            )

        Played (Ok _) ->
            ( model, session, Cmd.none )

        Played (Err ( newSession, _ )) ->
            ( model, newSession, Cmd.none )

        Prev ->
            ( model, session, Task.attempt SkipTrack (Request.prev session) )

        Refresh _ ->
            ( model, session, Task.attempt Refreshed (Request.get session) )

        Refreshed (Ok player) ->
            let
                updateTick =
                    if player.playing then
                        1000

                    else
                        Player.defaultTick
            in
            ( { model
                | player = Just player
                , refreshTick = updateTick
              }
            , session
            , Cmd.none
            )

        Refreshed (Err ( newSession, _ )) ->
            ( model, newSession, Cmd.none )

        Seek int ->
            ( model
            , session
            , String.toInt int
                |> Maybe.map (Request.seek session >> Task.attempt SkipTrack)
                |> Maybe.withDefault Cmd.none
            )

        Seeked (Ok _) ->
            ( model, session, Task.attempt Refreshed (Request.get session) )

        Seeked (Err ( newSession, _ )) ->
            ( model, newSession, Cmd.none )

        SkipTrack (Ok _) ->
            ( model, session, Cmd.none )

        SkipTrack (Err ( newSession, _ )) ->
            ( model, newSession, Cmd.none )


subscriptions : PlayerContext -> Sub Msg
subscriptions model =
    Sub.batch [ Time.every model.refreshTick Refresh ]


view : PlayerContext -> Html Msg
view { player } =
    case player of
        Just ({ track } as player_) ->
            let
                cover =
                    Image.filterByWidth 64 track.album.images

                percentDuration =
                    String.fromFloat (toFloat player_.progress / toFloat track.duration * 100) ++ "%"
            in
            div [ class "Player" ]
                [ div [ class "PlayerControl" ]
                    [ if player_.playing then
                        button
                            [ class "PlayerControl__btn play"
                            , onClick Pause
                            ]
                            [ i [ class "icon-pause" ] [] ]

                      else
                        button
                            [ class "PlayerControl__btn play"
                            , onClick Play
                            ]
                            [ i [ class "icon-play" ] [] ]
                    , button
                        [ class "PlayerControl__btn"
                        , onClick Prev
                        ]
                        [ i [ class "icon-to-start" ] [] ]
                    , button
                        [ class "PlayerControl__btn"
                        , onClick Next
                        ]
                        [ i [ class "icon-to-end" ] [] ]
                    ]
                , div [ class "PlayerCurrent" ]
                    [ img [ class "PlayerCurrent__cover", src cover.url ] []
                    , div [ class "PlayerCurrent__control" ]
                        [ div []
                            ([ span [ class "PlayerCurrent__song" ] [ text track.name ]
                             , span [] [ text " - " ]
                             ]
                                ++ artistsView track.artists
                            )
                        , div [ class "PlayerCurrent__bar" ]
                            [ span [ class "PlayerCurrent__time" ] [ text <| Track.durationFormat player_.progress ]
                            , div [ class "Range" ]
                                [ input
                                    [ class "Range__input"
                                    , type_ "range"
                                    , Html.Attributes.min "0"
                                    , Html.Attributes.value <| String.fromInt player_.progress
                                    , Html.Attributes.max <| String.fromInt track.duration
                                    , onInput Seek
                                    ]
                                    []
                                , div [ class "Range__progress", style "width" percentDuration ] []
                                ]
                            , span [ class "PlayerCurrent__time" ] [ text <| Track.durationFormat track.duration ]
                            ]
                        ]
                    ]
                ]

        Nothing ->
            div [ class "Player" ] []
