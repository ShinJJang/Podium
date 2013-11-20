# -*- coding: utf-8 -*-
from django.shortcuts import redirect, render, render_to_response, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse, HttpResponseServerError
from django.template import Context
from django.views.decorators.csrf import csrf_exempt
from .models import *
from django.forms.models import model_to_dict

from base64 import b64encode
import time
import hmac
import hashlib
import json

import sys
reload(sys)
sys.setdefaultencoding("utf-8")

@login_required
def home(request):
    user = request.user
    ctx = Context({
        'user': user,
        'page_title': 'Podium'
    })
    return render(request, 'index.html', ctx)

@login_required
def pui(request):
    user = request.user
    ctx = Context({
        'user': user,
        'page_title': 'PUI Framework'
    })
    return render(request, 'pui.html', ctx)


@login_required
def people(request, people_id):
    user = request.user
    user_pageowner = User.objects.get(id=people_id)
    ctx = Context({
        'user': user,
        'user_pageowner': user_pageowner,
        'page_title': user_pageowner.username
    })
    return render(request, 'profile.html', ctx)


@login_required
def post(request, post_id):
    user = request.user
    post = get_object_or_404(Posts, pk=post_id)

    if post.open_scope == 1:
        if user != post.user_key and user != post.target_user:
            return home(request)

    ctx = Context({
        'user': user,
        'post': post,
        'page_title': post.user_key.username+" - "+post.post[0:40],
    })
    return render(request, 'single_post.html', ctx)


@login_required
def private(request):
    user = request.user
    ctx = Context({
        'user': user,
        'page_title': user.username
    })
    return render(request, 'private.html', ctx)

@login_required
def group(request, group_id):
    user = request.user
    group = get_object_or_404(Groups, pk=group_id)

    membership_id = None
    permission = -1
    try:
        membership = Memberships.objects.filter(user_key=user, group_key=group)[0]
        membership_id = membership.id
        permission = membership.permission

    except:
        pass

    if group.open_scope == 2 and permission == -1:
        return home(request)  # TODO #1 - 비공개 그룹 페이지 안내 화면 추가 -> 주소 바꾸는 방법도

    ctx = Context({
        'user': user,
        'group': group,
        'membership_id': membership_id,
        'permission': permission,
        'page_title': group.group_name
    })
    return render(request, 'group.html', ctx)


@login_required
def group_create(request):
    user = request.user
    ctx = Context({
        'user': user,
        'page_title': '새 그룹 만들기'
    })
    return render(request, 'group_create.html', ctx)


@login_required
def group_settings(request, group_id):
    user = request.user
    group_ = Groups.objects.get(id=group_id)

    permission = -1
    try:
        membership = Memberships.objects.filter(user_key=user, group_key=group_)[0]
        permission = membership.permission
    except:
        pass

    if permission < 1:
        return group(request, group_id)    # TODO #1 - 비공개 그룹 페이지 안내 화면 추가 -> 주소 바꾸는 방법도

    ctx = Context({
        'user': user,
        'group': group_,
        'permission': permission,
        'page_title': group_.group_name
    })
    return render(request, 'group_settings.html', ctx)


@login_required
def group_members(request, group_id):
    user = request.user
    group = Groups.objects.get(id=group_id)

    permission = -1
    try:
        membership = Memberships.objects.filter(user_key=user, group_key=group)[0]
        permission = membership.permission
    except:
        pass

    if permission == -1 and group.open_scope == 2:
        return home(request)    # TODO #1 - 비공개 그룹 페이지 안내 화면 추가 -> 주소 바꾸는 방법도

    ctx = Context({
        'user': user,
        'group': group,
        'permission': permission,
        'page_title': group.group_name
    })
    return render(request, 'group_members.html', ctx)


@login_required
def get_chat_list(request):
    user = request.user
    chat_rooms = ChatRoom.objects.filter(chatparticipants__user_key=user).annotate(models.Max('userchattingmessage__created')).order_by('-userchattingmessage__created__max')
    chat_room = []
    print chat_rooms
    for room in chat_rooms:
        chat_room_item = {}
        chat_room_item['room_id'] = room.id
        chat_room_item['room_name'] = room.chat_room_name
        chat_room_item['participant_count'] = room.participant_count
        last_message = UserChattingMessage.objects.filter(chat_room_key=room).order_by('-created')
        try:
            chat_room_item['last_message_speaker'] = last_message[0].user_key.id
            chat_room_item['last_message'] = last_message[0].chatting_message
        except:
            chat_room_item['last_message_speaker'] = ''
            chat_room_item['last_message'] = ''
        chat_room_participants = ChatParticipants.objects.filter(chat_room_key=room)
        i = 1
        for participant in chat_room_participants:
            participant_item = {}
            participant_item['participant_id'] = participant.user_key.id
            participant_item['participant_name'] = participant.user_key.username
            participant_picture = UserPictures.objects.filter(user_key=participant.user_key).order_by('-created')
            try:
                participant_item['participant_picture'] = str(participant_picture[0].picture)
            except:
                participant_item['participant_picture'] = ''
            chat_room_item['participant_' + str(i)] = participant_item
            i = i + 1
        chat_room.append(chat_room_item)
        i = 1
    print chat_room
    return HttpResponse(json.dumps(chat_room), content_type='application/json')


def sign_s3(request):  #request에 메서드, 유저아이디는 x db조회, 파일 카운트를 추가.오브젝트네임이 키값이다.

    AWS_ACCESS_KEY = "AKIAJKZRCQKYZ7EHIXYA"
    AWS_SECRET_KEY = "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"
    S3_BUCKET = "somapodium"
    object_name = request.GET.get('s3_object_name')
    mime_type = request.GET.get('s3_object_type')
    method = request.GET.get('s3_method')
    file_count = request.GET.get('s3_file_count')
    expires = int(time.time() + 10)
    amz_headers = "x-amz-acl:public-read"
    user_id = request.user.id
    if file_count.find("soma") != -1 :
        put_request = "%s\n\n%s\n%d\n%s\n/%s/%s/%s/%s" % (method, mime_type, expires, amz_headers, S3_BUCKET, file_count, str(user_id), object_name)
        hashed = hmac.new(AWS_SECRET_KEY, put_request, hashlib.sha1)
        signature = b64encode(hashed.digest())
        url = 'https://%s.s3.amazonaws.com/%s/%s/%s' % (S3_BUCKET, file_count, str(user_id), object_name)
        signed_request = '%s?AWSAccessKeyId=%s&Expires=%d&Signature=%s' % (url, AWS_ACCESS_KEY, expires, signature)
    else :
        put_request = "%s\n\n%s\n%d\n%s\n/%s/%s/%s/%s" % (method, mime_type, expires, amz_headers, S3_BUCKET, str(user_id), file_count, object_name)
        hashed = hmac.new(AWS_SECRET_KEY, put_request, hashlib.sha1)
        signature = b64encode(hashed.digest())
        url = 'https://%s.s3.amazonaws.com/%s/%s/%s' % (S3_BUCKET, str(user_id), file_count, object_name)
        signed_request = '%s?AWSAccessKeyId=%s&Expires=%d&Signature=%s' % (url, AWS_ACCESS_KEY, expires, signature)




    return HttpResponse(json.dumps({
        'signed_request': signed_request,
        'url': url
    }), content_type='application/json')


def get_file_count(request):  #request에 메서드, 유저아이디는 x db조회, 파일 카운트를 추가.오브젝트네임이 키값이다.
    user = request.user
    object_file_count, user_file_count = UserFileCount.objects.get_or_create(user_key=user)
    print object_file_count.file_count
    return HttpResponse(object_file_count.file_count)


@login_required
def chat(request):
    users = User.objects.select_related().all()[0:100]
    ctx = Context({
        'users': users
    })
    return render(request, 'chat_index.html', ctx)


@login_required
@csrf_exempt
def vote(request):
    user = request.user

    if request.method == 'POST':
        poll_object = {}
        try:
            # poll_object = Polls(id=request.REQUEST["id"])
            json_data = json.loads(request.body)
            poll_object = Polls.objects.get(id=json_data['id'])
            poll = json.loads(poll_object.poll)
            user_checked = False
            user_checked_index = -1
            user_option_index = -1

            # 이미 체크했는지 확인
            for oindex, option in enumerate(poll['options']):
                for cindex, user_in_poll in enumerate(option['users']):
                    if user_in_poll['id'] == user.id:
                        user_checked = True
                        user_checked_index = cindex
                        user_option_index = oindex

            if user_checked:
                del poll['options'][user_option_index]['users'][user_checked_index]
                if json_data['item'] != user_option_index:
                    poll['options'][json_data['item']]['users'].append({'id': user.id, 'username': user.username})
                    user_option_index = json_data['item']
                else:
                    user_option_index = -1
            else:
                poll['options'][json_data['item']]['users'].append({'id': user.id, 'username': user.username})
                user_option_index = json_data['item']

            poll_object.poll = json.dumps(poll)
            poll_object.save()

            return_obj = model_to_dict(poll_object)
            return_obj['user_checked'] = user_option_index

            poll_object = json.dumps(return_obj)

        except KeyError:
            HttpResponseServerError("Key Error")

        return HttpResponse(poll_object, content_type='application/json')
    else:
        return HttpResponse("잘못된 접근입니다.")

@csrf_exempt
def chat_comment(request):
    print "chat_comment"
    message = request.POST.get('comment')
    user_id = request.POST.get('user_id')
    room_id = request.POST.get('room_id')
    chat_room_key = ChatRoom.objects.get(id=room_id)
    user_key = User.objects.get(id=user_id)
    print "testt" + room_id
    if request.POST.get('type') == 'USER_OUT':  # todo(baek) 유저가 나갔을 경우 소켓 커넥트를 폴스로.변경
        print 'user_out'
        out_participant = ChatParticipants.objects.get(chat_room_key=chat_room_key, user_key=user_key)
        out_participant.connected_chat = False
        out_participant.save()
        print 'user_out_complete'
        return HttpResponse("user out in socket")

    elif request.POST.get('type') == "NO_CHECK_NOTI":  # todo(baek) 타입을 추가하여 채팅알림을 만들어야 할 때 소켓커넥트 체크하는 함수 추가(알림도 만듬)
        try:
            chat_message = UserChattingMessage.objects.create(chat_room_key=chat_room_key, user_key=user_key, chatting_message=message)
            return HttpResponse("create chat_message")
        except Exception, e:
            return HttpResponseServerError(str(e))

    elif request.POST.get('type') == "CHECK_NOTI":
        print "check noti"
        chat_noti_check(request.POST.get('room_id'), user_key)
        try:
            chat_message = UserChattingMessage.objects.create(chat_room_key=chat_room_key, user_key=user_key, chatting_message=message)
            return HttpResponse("create chat_message")
        except Exception, e:
            return HttpResponseServerError(str(e))

def chat_noti_check(room_id, user_key): #  todo(baek) chatroom을 기반으로 참여하고 있는 참가자들의 소켓 커넥션 여부를 확인하여 알림 메시지를 만든다.

    chat_room_participants = ChatParticipants.objects.filter(chat_room_key=room_id)
    for chat_room_participant in chat_room_participants:
        if chat_room_participant.connected_chat == False:
            ChatNotification.objects.get_or_create(chat_room_key=chat_room_participant.chat_room_key, from_user_key=user_key, to_user_key=chat_room_participant.user_key)

    print chat_room_participants
    return 0


@login_required()
@csrf_exempt
def set_participant_socket_connection(request):
    user = request.user
    if request.method == 'POST':
        print request.POST.get('room_id')
        participant = ChatParticipants.objects.get(chat_room_key=request.POST.get('room_id'), user_key=user);
        participant.connected_chat = True
        participant.save()
        print participant
        return HttpResponse("put request")
    else:
        return HttpResponse("잘못된 접근입니다.")
