module Page.Collection exposing (Msg(..), init, update, view)

import Data.Album exposing (AlbumId, AlbumUri)
import Data.Image exposing (ImageSize(..), imageView)
import Data.Meta exposing (CollectionModel, pagingInit)
import Data.Modal exposing (modalInit)
import Data.Playlist
    exposing
        ( Playlist
        , PlaylistId
        , PlaylistPaging
        , decodePlaylist
        , decodePlaylistPaging
        , playlistInit
        )
import Data.Session exposing (Session)
import Data.Track exposing (TrackId, TrackSimplified, decodeTrackSimplified, encodeDelCollectionAlbum)
import Html exposing (Html, a, div, i, text)
import Html.Attributes exposing (class, classList)
import Html.Events exposing (onClick)
import Http
import Json.Decode as Decode exposing (map)
import Request
import Route
import Utils
import Views.Modal


init : String -> Session -> ( CollectionModel, Cmd Msg )
init id session =
    ( { collection = playlistInit
      , albums = pagingInit
      , modal = modalInit
      }
    , Cmd.batch
        [ Http.send SetCollection <|
            Request.get "playlists/" id "" decodePlaylist session.token
        , Http.send SetCollectionTracks <|
            Request.get "playlists/" id "/tracks" decodePlaylistPaging session.token
        ]
    )


type Msg
    = SetCollection (Result Http.Error Playlist)
    | SetCollectionTracks (Result Http.Error PlaylistPaging)
    | PlayAlbum AlbumUri
    | DelCollectionAlbum PlaylistId (List TrackId)
    | DeletedCollectionAlbum (Result Http.Error ())
    | ModalOpen (Result Http.Error (List TrackSimplified))
    | ModalGetTrack AlbumId
    | ModalAddTrack PlaylistId
    | SetModalTrack (Result Http.Error ())
    | ModalClear


update : Session -> Msg -> CollectionModel -> ( CollectionModel, Cmd Msg )
update session msg ({ modal } as model) =
    case msg of
        SetCollection (Ok playlist) ->
            ( { model | collection = playlist }
            , Cmd.none
            )

        SetCollection (Err _) ->
            ( model, Cmd.none )

        SetCollectionTracks (Ok e) ->
            let
                concat =
                    model.albums.items ++ e.items
            in
            ( { model
                | albums =
                    { items = concat
                    , next = ""
                    }
              }
            , if e.next /= "" then
                Cmd.batch
                    [ Http.send SetCollectionTracks <|
                        Request.getPaging e.next decodePlaylistPaging session.token
                    ]

              else
                Cmd.none
            )

        SetCollectionTracks (Err _) ->
            ( model, Cmd.none )

        PlayAlbum _ ->
            ( model, Cmd.none )

        DelCollectionAlbum playlistId trackList ->
            ( model
            , Cmd.batch
                [ Http.send DeletedCollectionAlbum <|
                    Request.delete "playlists/" playlistId "/tracks" (encodeDelCollectionAlbum trackList) session.token
                ]
            )

        DeletedCollectionAlbum (Ok _) ->
            ( model, Cmd.none )

        DeletedCollectionAlbum (Err _) ->
            ( model, Cmd.none )

        ModalOpen (Ok trackList) ->
            let
                firstTrack =
                    trackList
                        |> List.map (\f -> f.uri)
                        |> List.take 1
            in
            ( { model | modal = { modal | isOpen = True, inPocket = firstTrack } }
            , Cmd.none
            )

        ModalOpen (Err _) ->
            ( model, Cmd.none )

        ModalGetTrack albumId ->
            ( model
            , Cmd.batch
                [ Http.send ModalOpen <|
                    Request.get "albums/" albumId "/tracks" (Decode.at [ "items" ] (Decode.list decodeTrackSimplified)) session.token
                ]
            )

        ModalAddTrack playlistId ->
            let
                trackList =
                    String.concat model.modal.inPocket
            in
            ( model
            , Http.send SetModalTrack <|
                Request.post "playlists/" playlistId ("/tracks?position=0&uris=" ++ trackList) session.token
            )

        SetModalTrack (Ok _) ->
            ( { model | modal = { modal | isOpen = False } }
            , Cmd.none
            )

        SetModalTrack (Err _) ->
            ( model, Cmd.none )

        ModalClear ->
            ( { model | modal = { modal | isOpen = False } }
            , Cmd.none
            )


view : Session -> CollectionModel -> ( String, List (Html Msg) )
view session { collection, modal, albums } =
    let
        reducedCollectionName =
            String.replace "#Collection " "" collection.name

        albumList =
            albums.items
                |> List.map
                    (\a ->
                        { artists = a.artists
                        , album = a.album.name
                        , id = a.album.id
                        , uri = a.album.uri
                        , release_date = a.album.release_date
                        , images = a.album.images
                        , trackUri = a.uri
                        }
                    )

        albumItem album =
            let
                yearRelease =
                    Utils.releaseDateFormat album.release_date
            in
            div
                [ classList
                    [ ( "Album", True )
                    , ( "active", album.uri == session.player.item.album.uri )
                    ]
                ]
                [ a [ Route.href (Route.Album album.id), class "img" ] [ imageView Medium "Cover" album.images ]
                , div [] [ text album.album ]
                , div []
                    (album.artists
                        |> List.map
                            (\artist ->
                                a
                                    [ Route.href (Route.Artist artist.id)
                                    , class "artist-name"
                                    ]
                                    [ text artist.name ]
                            )
                    )
                , if reducedCollectionName /= yearRelease then
                    div [ class "date" ]
                        [ text <| "(" ++ yearRelease ++ ")"
                        ]

                  else
                    text ""
                , div [ class "Album__play", onClick <| PlayAlbum album.uri ]
                    [ i [ class "icon-play" ] []
                    ]
                , div [ class "Album__add", onClick <| ModalGetTrack album.id ]
                    [ i [ class "icon-add" ] []
                    ]
                , div [ class "Album__del", onClick <| DelCollectionAlbum collection.id [ album.trackUri ] ]
                    [ i [ class "icon-del" ] []
                    ]
                ]
    in
    ( reducedCollectionName
    , [ Views.Modal.view
            { isOpen = modal.isOpen
            , session = session
            , close = ModalClear
            , add = ModalAddTrack
            }
      , div [ class "drawer-content" ]
            [ div [ class "Title" ] [ text reducedCollectionName ]
            , div []
                [ albumList
                    |> List.map albumItem
                    |> div [ class "album-list-wrapper" ]
                ]
            ]
      ]
    )
