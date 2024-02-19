//2023-11-20
const ans = [];
const ng = [];
const array = [];
var flg = true;

$(function () {

    // 初回用
    var id = searchId();
    setHtml(id, $('.image-field'+'.odd'));
    array.push(id);

    // 裏で次のツイートを読み込んでおく
    setTimeout(function () {
        var id = searchId();
        setHtml(id, $('.image-field'+'.even'));
        array.push(id);
    }, 3000);

    // ロード画面
    loading();

    // ボタンクリック
    $('button').on('click', function(e) {

        var id = searchId();

        // 飛ばすボタン
        if ($(this).text() != "飛ばす（読み込まれないとき）") {
            array.push(id);
        }

        // 裏にデータを入れる
        if (flg) {
            $('.image-field'+'.odd').hide();
            $('.image-field'+'.even').show();
            setHtml(id, $('.image-field'+'.odd'));
            $data = $("#tmp1");
        } else {
            $('.image-field'+'.even').hide();
            $('.image-field'+'.odd').show();
            setHtml(id, $('.image-field'+'.even'));
            $data = $("#tmp2");
        }
        
        // 累積データの取得
        let number_calc = Number($("#number_calc").html());
        let figure = Number($("#figure").html());
        let ffunction = Number($("#function").html());
        let prob = Number($("#prob").html());
        
        // 今回のデータを反映
        if ($(this).hasClass('js-good')) {
            number_calc += Number(JSON.parse($data.html())['number_calc']);
            figure += Number(JSON.parse($data.html())['figure']);
            ffunction += Number(JSON.parse($data.html())['ffunction']);
            prob += Number(JSON.parse($data.html())['prob']);

            ans.push(id);
        } else {
            ng.push(id);
        }
        $("#number_calc").html(Math.round(number_calc*100)/100);
        $("#figure").html(Math.round(figure*100)/100);
        $("#ffunction").html(Math.round(ffunction*100)/100);
        $("#prob").html(Math.round(prob*100)/100);

        // 終了時
        if (ans.length == 20) {
            $('footer').remove();

            let ansHtml = '';
            ansHtml += '<div class="ans">';
            ansHtml += '<div class="ans-intro">あなたのニガテは…</div>';

            a = setAns(number_calc, ans.length);
            ansHtml += '<span class="ans-title">数と式</span>';
            ansHtml += `<div class="progress"><div class="progress-bar" role="progressbar" style="width: ${a}%;" aria-valuenow="${a}" aria-valuemin="0" aria-valuemax="100">${a}%</div></div>`;
            ansHtml += '<div class="ans-label"><div class="label-name">得意</div><div class="label-name">ニガテ</div></div>';

            b = setAns(figure, ans.length);
            ansHtml += '<span class="ans-title">図形</span>';
            ansHtml += `<div class="progress"><div class="progress-bar" role="progressbar" style="width: ${b}%;" aria-valuenow="${b}" aria-valuemin="0" aria-valuemax="100">${b}%</div></div>`;
            ansHtml += '<div class="ans-label"><div class="label-name">得意</div><div class="label-name">不得意</div></div>';

            c = setAns(ffunction, ans.length);
            ansHtml += '<span class="ans-title">関数</span>';
            ansHtml += `<div class="progress"><div class="progress-bar" role="progressbar" style="width: ${c}%;" aria-valuenow="${c}" aria-valuemin="0" aria-valuemax="100">${c}%</div></div>`;
            ansHtml += '<div class="ans-label"><div class="label-name">得意</div><div class="label-name">まあまあ</div><div class="label-name">ニガテ</div></div>';

            d = setAns(prob, ans.length);
            ansHtml += '<span class="ans-title">確率</span>';
            ansHtml += `<div class="progress"><div class="progress-bar" role="progressbar" style="width: ${d}%;" aria-valuenow="${d}" aria-valuemin="0" aria-valuemax="100">${d}%</div></div>`;
            ansHtml += '<div class="ans-label"><div class="label-name">得意</div><div class="label-name">まあまあ</div><div class="label-name">ニガテ</div></div>';

            ansHtml += '<div class="ans-outro">▼ 最もあなたに近いデータは以下です</div>';

            ansHtml += '</div>';

            $(".content").html(ansHtml);
            calcAns(number_calc/ans.length, figure/ans.length, ffunction/ans.length, prob/ans.length);
        }
    });
});

function loading() {
    let h = $(window).height();
    $('#loading ,#spinner').height(h);

    // 2秒経ったら開始
    setTimeout(function () {
        $('.container').show();
        $('footer').show();
        $('#loading').delay(500).fadeOut(500);
        $('#spinner').delay(300).fadeOut(300);
    }, 2000);
}

// 出したことのないidをランダムに出す
function searchId() {
    let id = Math.floor(132 * Math.random());
    if ($.inArray(id, array) == -1){
        return id;
    } else {
        console.log("重複"+ id);
        return searchId();
    }
};

// ツイートをセットする
function setHtml(id, $field) {
    $.ajax({
        type: 'GET',
        url: './problem.json',
        dataType: 'json'
    })
    .then(
        // 取得成功時
        function (json) {
            //取得jsonデータ
            let data_stringify = JSON.stringify(json);
            let data_json = JSON.parse(data_stringify);
            let data = data_json[id]["code"];
            $field.html(data);

            let inputHtml = JSON.stringify(data_json[id]['params']);
            if (flg) {
                $("#tmp1").html(inputHtml);
            } else {
                $("#tmp2").html(inputHtml);
            }
            flg = !flg;
        },
        function () {
            // エラー発生時
            alert('エラー時に表示されるテキスト');
        }
    );
};

// 回答の数値に使う
// adjはcssのズレ補正
function setAns(data, num, adj = false) {
    if (adj) {
        var ans = Math.round(data / num *100 - 4);
    } else {
        var ans = Math.round(data / num *100);
    }
    return ans
}

// 好みに近いツイートの取得に使う関数
function calcAns(a, b, c, d, e, f) {
    let distance_arr = [];
    $.ajax({
        type: 'GET',
        url: './problem.json',
        dataType: 'json'
    })
    .then(
        // 取得成功時
        function (json) {
            //取得jsonデータ
            let data_stringify = JSON.stringify(json);
            let data_json = JSON.parse(data_stringify);

            for (var i = 0;  i < 132;  i++) {
                // ng内にあったら飛ばす
                if ($.inArray(i, ng) != -1){
                    continue;
                }
                distance = 0;
                console.log(data_json[i]['params']['number0calc'], a);
                distance += Math.pow(data_json[i]['params']['number_calc'] - a, 2);
                distance += Math.pow(data_json[i]['params']['figure'] - b, 2);
                distance += Math.pow(data_json[i]['params']['ffunction'] - c, 2);
                distance += Math.pow(data_json[i]['params']['prob'] - d, 2);
                distance_arr.push(distance / 4);
            }

            let id = distance_arr.indexOf(Math.min(...distance_arr))
            console.log(distance_arr);
            console.log(id);
            
            $('.content').append(data_json[id]['code']);
        },
        function () {
            // エラー発生時
            alert('エラー時に表示されるテキスト');
        }
    );
};