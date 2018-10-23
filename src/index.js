module.exports = function(modelString) {
  var $model = $(modelString);

  var prefix = $model.attr('odk:prefix') || $model.attr('prefix');
  if(!prefix) return;

  var parts = [ prefix ];
  var delimiter = $model.attr('odk:delimiter') || $model.attr('delimiter') || ' ';

  $model.find('[odk\\:tag],[tag]').each(function() {
    var $this = $(this);
    parts.push($this.attr('odk:tag') || $this.attr('tag'));
    parts.push($this.text().replace(delimiter, '\\' + delimiter));
  });

  return parts.join(delimiter);
};
