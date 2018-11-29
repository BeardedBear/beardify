module Page.Album exposing (Msg(..), init, update, view)

import Data.Album
import Data.Image as Image exposing (..)
import Data.Meta
import Data.Session
import Data.Track
import Html.Styled as Html exposing (..)
import Html.Styled.Attributes exposing (..)
import Html.Styled.Events exposing (onClick)
import Http
import Json.Decode as Decode exposing (..)
import List.Extra as LE
import Meta
import Request
import Route
import Time
import Utils
import Views.Artist


init : Data.Session.Session -> ( Data.Meta.AlbumModel, Cmd Msg )
init session =
    ( { album = Data.Album.init
      , tracks = []
      }
    , Cmd.batch
        [ Http.send SetAlbum <| Request.get "albums/" (Utils.getId session.url) "" Data.Album.decodeAlbum session.token
        , Http.send SetAlbumTracks <| Request.get "albums/" (Utils.getId session.url) "/tracks" (Decode.at [ "items" ] (Decode.list Data.Track.decodeTrackSimplified)) session.token
        ]
    )


type Msg
    = SetAlbum (Result Http.Error Data.Album.Album)
    | SetAlbumTracks (Result Http.Error (List Data.Track.TrackSimplified))
    | MetaMsg Meta.Msg


update : Data.Session.Session -> Msg -> Data.Meta.AlbumModel -> ( Data.Meta.AlbumModel, Cmd Msg )
update session msg model =
    case msg of
        SetAlbum (Ok e) ->
            ( { model | album = e }
            , Cmd.none
            )

        SetAlbum (Err _) ->
            ( model, Cmd.none )

        SetAlbumTracks (Ok e) ->
            ( { model | tracks = e }
            , Cmd.none
            )

        SetAlbumTracks (Err e) ->
            ( model, Cmd.none )

        MetaMsg e ->
            let
                timestamp =
                    Time.millisToPosix 1

                ( _, newCmd ) =
                    Meta.update e
                        { config =
                            { token = session.token
                            , currentDate =
                                { year = Time.toYear Time.utc timestamp
                                , month = Time.toMonth Time.utc timestamp
                                , day = Time.toDay Time.utc timestamp
                                , hour = Time.toHour Time.utc timestamp
                                , minute = Time.toMinute Time.utc timestamp
                                , second = Time.toSecond Time.utc timestamp
                                , milliSecond = Time.toMillis Time.utc timestamp
                                }
                            }
                        , page = Meta.AlbumPage model
                        , session = session
                        }
            in
            ( model
            , Cmd.map MetaMsg newCmd
            )


view : Data.Session.Session -> Data.Meta.AlbumModel -> ( String, List (Html Msg) )
view session model =
    let
        listTracksUri id =
            model.tracks
                |> LE.dropWhile (\e -> e.uri /= id)
                |> List.map (\k -> k.uri)

        trackItem t =
            div
                [ classList
                    [ ( "track album-page", True )
                    , ( "active", t.uri == session.player.item.uri )
                    ]
                ]
                [ div [] []
                , div [] [ text <| String.fromInt t.track_number ++ "." ]
                , div [ onClick <| MetaMsg (Meta.ChangePlayingTrack (listTracksUri t.uri)) ] [ text t.name ]
                , div [] [ text (Utils.durationFormat t.duration_ms) ]
                ]

        trackSumDuration =
            model.tracks
                |> List.map (\d -> d.duration_ms)
                |> List.sum
    in
    ( model.album.name
    , [ div [ onClick (MetaMsg Meta.NoOp), class "album-wrapper" ]
            [ div [ class "bg-cover" ] [ imageView Large model.album.images ]
            , div [ class "album-page-head" ]
                [ div [ class "heading-page" ] [ text model.album.name ]
                , div []
                    [ span [] [ text "By " ]
                    , span [] [ Views.Artist.artistList model.album.artists ]
                    ]
                ]
            , div [ class "album-page" ]
                [ div []
                    [ div [ class "album" ]
                        [ div [ class "img" ]
                            [ imageView Large model.album.images
                            ]
                        , div [ class "playing-btn", onClick <| MetaMsg (Meta.ChangePlaying model.album.uri) ] [ i [ class "icon-play" ] [] ]
                        , div [ class "add-btn" ] [ i [ class "icon-add" ] [] ]
                        , div [] [ text <| Utils.releaseDateFormat model.album.release_date ]
                        , div [] [ text <| Utils.durationFormatMinutes trackSumDuration ]
                        ]
                    ]
                , div []
                    [ div [] (model.tracks |> List.map trackItem)
                    ]
                ]
            ]
      ]
    )
