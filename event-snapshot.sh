#!/bin/bash

source ./config.sh

main () 
{
	#-----------------------------------------------------------------------
	#	reset the newest image file
	#-----------------------------------------------------------------------

	new_img_file=$1
	if [[ -z $new_img_file || ! -f $new_img_file ]]; then
		log "input file not exists."
		return 0
	fi

	nowtime=`date +%s`
	last_img_file=`redis-cli getset last-saved-image "$new_img_file"`

	if [[ -z $last_img_file || ! -f $last_img_file ]]; then
		redis-cli set last-static-info "$nowtime;true"
		log "initial run, report exit."
		report_remote $new_img_file
		return 0
	fi

	#-----------------------------------------------------------------------
	#	get the static image file from redis
	#-----------------------------------------------------------------------

	last_static_info=`redis-cli get last-static-info`

	if [ "$last_static_info" = "" ]; then
		redis-cli set last-static-info "$nowtime;true"
		log "static empty, report exit: $new_img_file"
		report_remote $new_img_file
		return 0
	fi

	IFS=';' read -r stitic_time is_reported <<< $last_static_info

	if [[ "$stitic_time" = "" || $stitic_time -eq 0 ]]; then
		redis-cli set last-static-info "$nowtime;false"
		log "static invalid, no report exit: $new_img_file"
		return 0
	fi

	#-----------------------------------------------------------------------
	#	now lpush save the last image, and delete the older	
	#-----------------------------------------------------------------------

	redis-cli lpush pre-delete-list $last_img_file

	que_len=`redis-cli llen pre-delete-list`
	if [ $que_len -ge $MAX_QUE_LEN ]; then
		to_delete=`redis-cli rpop pre-delete-list`
		if [[ -n $to_delete && -e $to_delete ]]; then
			unlink $to_delete
			#log "unlink $to_delete"
		fi
	fi

	#-----------------------------------------------------------------------
	#	compare the static and the new image
	#-----------------------------------------------------------------------

	cmp_res=`compare -metric RMSE $last_img_file $new_img_file null: 2>&1`
	IFS=" ()" read -r diff ndiff <<< "$cmp_res"

	old_img=`basename $last_img_file`
	new_img=`basename $new_img_file`
	log "compare (${old_img} - ${new_img}) = $diff"

	diff_val=`echo "($diff+0.5)/1" | bc`

	if [ $diff_val -gt $DIFF_THRESHOLD ]; then
		redis-cli set last-static-info "$stitic_time;false"
		log "image is changing, no report exit: $new_img_file"
		return 0
	fi

	#-----------------------------------------------------------------------
	#	same image, but not reach the trigger of report
	#-----------------------------------------------------------------------

	time_pass=$(($nowtime-$stitic_time))

	if [ $time_pass -lt $STATIC_SECS ]; then
		log "is waitting report(${time_pass}<${STATIC_SECS})..."
		return 0
	fi

	#-----------------------------------------------------------------------
	#	report the newest diffrence image
	#-----------------------------------------------------------------------

	if [ ! $is_reported = 'true' ]; then
		redis-cli set last-static-info "$stitic_time;true"
		report_remote $new_img_file
		return 0
	fi

	log "same image, ignore..."
	return 0
}

report_remote () 
{
	new_img_file=$1
	file_name=`basename $new_img_file`
	show_file=${SHOWS_ROOT}/${file_name}

	cp -f $new_img_file $show_file

	ifconfig_res=`ifconfig $AID_IFACE | grep -E "inet.*netmask"`
	IFS=' ' read -r x local_ip_addr xx <<< $ifconfig_res

	if [ -z $local_ip_addr ]; then
		log "can\'t not get ip address from ${wlp2s0b1}"
		return 1
	fi

	root_len=${#WEB_ROOT}
	root_path=${show_file:${root_len}}
	img_url="http://${local_ip_addr}${root_path}"

	log "image url: $img_url"

	remot_url="http://${REPORT_HOST}/hcx/pptliveurl"
	querystr="--data aidStr=${AID_STR} --data-urlencode url=${img_url}"
	http_code=`curl --silent --get --write-out "%{http_code}" --output /dev/null ${querystr} $remot_url`

	if [ $http_code -ne "200" ]; then
		log "curl error code: $http_code"
		return 1
	fi

	log "report successfully : ${remot_url} <<<<<<<<<<<<<<<<<<<<<<<"
	return 0
}

log() 
{
	echo "$@"
	logger -p user.notice -t ppt-graber "$@"
}

main "$@"
exit $?


