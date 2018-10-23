const assert = require('chai').assert;
const jsdom = require("jsdom").JSDOM;

describe('xform-conmpact-record-representation-for-sms', function() {
  const fn = require('../src/index');

  global.document = new jsdom();
  const window = new jsdom('').window;
  global.$ = require('jquery')(window);

  it('should return nothing if form has no prefix attribute', () => {
    // given
    const fullRecord =
        `<household id="household_survey" orx:version="2018061801" odk:delimiter="|">
          <meta>
            <instanceID>uuid:82724cc5-df6f-46bf-86d5-26683ae35d5b</instanceID>
          </meta>
          <lastname odk:tag="ln">Bar</lastname>
          <age>10</age>
        </household>`;

    // expect
    assert.isNotOk(fn(fullRecord));
  });

  it('should use space as delimiter if none specified', () => {
    // given
    const fullRecord =
        `<household id="household_survey" orx:version="2018061801" odk:prefix="hh">
          <meta>
            <instanceID>uuid:82724cc5-df6f-46bf-86d5-26683ae35d5b</instanceID>
          </meta>
          <firstname odk:tag="fn">MaryKate</firstname>
          <lastname odk:tag="ln">Doe</lastname>
          <age>15</age>
        </household>`;

    // expect
    assert.equal(fn(fullRecord), 'hh fn MaryKate ln Doe');
  });

  [
    {
      // N.B. ODK spec says that we should include fields which are missing from
      // the XML form in the compact representation.  We deviate from the
      // standard, and exclude these from the SMS.
      //expected_compact_representation: 'hh|fn||ln|Bar', <-- per ODK spec
      description: 'missing field',
      expected_compact_representation: 'hh|ln|Bar',
      full_record:
        `<household id="household_survey" orx:version="2018061801" odk:prefix="hh" odk:delimiter="|">
          <meta>
            <instanceID>uuid:82724cc5-df6f-46bf-86d5-26683ae35d5b</instanceID>
          </meta>
          <lastname odk:tag="ln">Bar</lastname>
          <age>10</age>
        </household>`,
    },
    {
      description: 'escape delimiters',
      expected_compact_representation: 'hh|fn|Mary\\|Kate|ln|Doe',
      full_record:
        `<household id="household_survey" orx:version="2018061801" odk:prefix="hh" odk:delimiter="|">
          <meta>
            <instanceID>uuid:82724cc5-df6f-46bf-86d5-26683ae35d5b</instanceID>
          </meta>
          <firstname odk:tag="fn">Mary|Kate</firstname>
          <lastname odk:tag="ln">Doe</lastname>
          <age>15</age>
        </household>`,
    },
  ].forEach(testCase =>
      it(`should encode '${testCase.description}' case correctly`, () =>
          assert.equal(fn(testCase.full_record),
                       testCase.expected_compact_representation)));

});
